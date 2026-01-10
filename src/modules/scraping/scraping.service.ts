import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { ScrapeJob, ScrapeJobStatus, ScrapeTargetType } from '../../entities/scrape-job.entity';
import { Navigation } from '../../entities/navigation.entity';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { ProductDetail } from '../../entities/product-detail.entity';
import { Review } from '../../entities/review.entity';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com';
  private readonly scrapeDelay: number;
  private readonly maxRetries: number;
  private readonly cacheTtlHours: number;

  constructor(
    @InjectRepository(ScrapeJob)
    private scrapeJobRepository: Repository<ScrapeJob>,
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private configService: ConfigService,
  ) {
    this.scrapeDelay = parseInt(this.configService.get('SCRAPE_DELAY_MS') || '2000', 10);
    this.maxRetries = parseInt(this.configService.get('SCRAPE_MAX_RETRIES') || '3', 10);
    this.cacheTtlHours = parseInt(this.configService.get('SCRAPE_CACHE_TTL_HOURS') || '24', 10);
  }

  async scrapeNavigation(): Promise<Navigation[]> {
    this.logger.log('Starting navigation scrape');

    const job = await this.createScrapeJob(this.baseUrl, ScrapeTargetType.NAVIGATION);

    try {
      await this.updateJobStatus(job.id, ScrapeJobStatus.PROCESSING);

      const navigationItems = [];

      const crawler = new PlaywrightCrawler({
        requestHandlerTimeoutSecs: 60,
        maxRequestRetries: this.maxRetries,
        async requestHandler({ page, request }) {
          await page.waitForLoadState('networkidle');

          // Extract navigation menu items
          const navItems = await page.$$eval('nav a, header a, .navigation a, .menu a', (links) => {
            const seen = new Set();
            return links
              .map((link) => ({
                title: link.textContent?.trim() || '',
                url: link.getAttribute('href') || '',
              }))
              .filter((item) => {
                if (!item.title || !item.url || seen.has(item.url)) return false;
                seen.add(item.url);
                return (
                  item.title.length > 0 &&
                  item.title.length < 100 &&
                  !item.url.includes('account') &&
                  !item.url.includes('login') &&
                  !item.url.includes('cart')
                );
              });
          });

          navigationItems.push(...navItems);
        },
      });

      await crawler.run([this.baseUrl]);

      // Save to database
      const savedItems = [];
      for (const item of navigationItems) {
        const slug = this.generateSlug(item.title);
        const fullUrl = item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`;

        let navItem = await this.navigationRepository.findOne({ where: { slug } });
        if (!navItem) {
          navItem = this.navigationRepository.create({
            title: item.title,
            slug,
            url: fullUrl,
            lastScrapedAt: new Date(),
          });
        } else {
          navItem.lastScrapedAt = new Date();
          navItem.url = fullUrl;
        }

        savedItems.push(await this.navigationRepository.save(navItem));
      }

      await this.updateJobStatus(job.id, ScrapeJobStatus.COMPLETED);
      this.logger.log(`Navigation scrape completed: ${savedItems.length} items`);

      return savedItems;
    } catch (error) {
      this.logger.error(`Navigation scrape failed: ${error.message}`, error.stack);
      await this.updateJobStatus(job.id, ScrapeJobStatus.FAILED, error.message);
      throw error;
    }
  }

  async scrapeCategories(navigationId?: string): Promise<Category[]> {
    this.logger.log(`Starting category scrape for navigation: ${navigationId || 'all'}`);

    const navigations = navigationId
      ? [await this.navigationRepository.findOne({ where: { id: navigationId } })]
      : await this.navigationRepository.find();

    const allCategories = [];

    for (const navigation of navigations.filter(Boolean)) {
      const job = await this.createScrapeJob(navigation.url, ScrapeTargetType.CATEGORY, {
        navigationId: navigation.id,
      });

      try {
        await this.updateJobStatus(job.id, ScrapeJobStatus.PROCESSING);

        const categories = await this.scrapeCategoriesFromUrl(navigation.url, navigation.id);
        allCategories.push(...categories);

        await this.updateJobStatus(job.id, ScrapeJobStatus.COMPLETED);
      } catch (error) {
        this.logger.error(`Category scrape failed for ${navigation.title}: ${error.message}`);
        await this.updateJobStatus(job.id, ScrapeJobStatus.FAILED, error.message);
      }
    }

    return allCategories;
  }

  private async scrapeCategoriesFromUrl(url: string, navigationId: string): Promise<Category[]> {
    const categories = [];

    const crawler = new PlaywrightCrawler({
      requestHandlerTimeoutSecs: 60,
      maxRequestRetries: this.maxRetries,
      async requestHandler({ page }) {
        await page.waitForLoadState('networkidle');

        // Extract category links
        const catItems = await page.$$eval(
          '.category-list a, .categories a, .filter a, aside a',
          (links) => {
            return links
              .map((link) => ({
                title: link.textContent?.trim() || '',
                url: link.getAttribute('href') || '',
                count: parseInt(
                  link.textContent?.match(/\((\d+)\)/)?.[1] || '0',
                  10,
                ),
              }))
              .filter((item) => item.title.length > 0 && item.url.length > 0);
          },
        );

        categories.push(...catItems);
      },
    });

    await crawler.run([url]);

    // Save to database
    const savedCategories = [];
    for (const item of categories) {
      const slug = this.generateSlug(item.title);
      const fullUrl = item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`;

      let category = await this.categoryRepository.findOne({ where: { slug, navigationId } });
      if (!category) {
        category = this.categoryRepository.create({
          navigationId,
          title: item.title,
          slug,
          url: fullUrl,
          productCount: item.count || 0,
          lastScrapedAt: new Date(),
        });
      } else {
        category.lastScrapedAt = new Date();
        category.productCount = item.count || category.productCount;
      }

      savedCategories.push(await this.categoryRepository.save(category));
    }

    return savedCategories;
  }

  async scrapeProducts(categoryId: string, limit = 20, page = 1): Promise<Product[]> {
    this.logger.log(`Starting product scrape for category: ${categoryId}, page: ${page}`);

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new Error('Category not found');
    }

    // Check cache
    if (this.isCacheValid(category.lastScrapedAt)) {
      this.logger.log('Using cached products');
      return this.productRepository.find({
        where: { categoryId },
        take: limit,
        skip: (page - 1) * limit,
      });
    }

    const job = await this.createScrapeJob(category.url, ScrapeTargetType.PRODUCT_LIST, {
      categoryId,
      page,
      limit,
    });

    try {
      await this.updateJobStatus(job.id, ScrapeJobStatus.PROCESSING);

      const products = [];
      const url = `${category.url}?page=${page}`;

      const crawler = new PlaywrightCrawler({
        requestHandlerTimeoutSecs: 60,
        maxRequestRetries: this.maxRetries,
        async requestHandler({ page: playwrightPage }) {
          await playwrightPage.waitForLoadState('networkidle');

          // Extract product cards
          const productCards = await playwrightPage.$$eval(
            '.product-card, .product-item, .product, [data-product]',
            (cards) => {
              return cards.map((card) => {
                const titleEl = card.querySelector('h2, h3, .title, .product-title');
                const priceEl = card.querySelector('.price, .product-price, [data-price]');
                const imgEl = card.querySelector('img');
                const linkEl = card.querySelector('a');
                const authorEl = card.querySelector('.author, .product-author');

                return {
                  title: titleEl?.textContent?.trim() || '',
                  price: priceEl?.textContent?.trim().replace(/[^\d.]/g, '') || '',
                  imageUrl: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '',
                  sourceUrl: linkEl?.getAttribute('href') || '',
                  author: authorEl?.textContent?.trim() || '',
                };
              }).filter((p) => p.title && p.sourceUrl);
            },
          );

          products.push(...productCards);
        },
      });

      await crawler.run([url]);
      await this.delay(this.scrapeDelay);

      // Save to database
      const savedProducts = [];
      for (const item of products.slice(0, limit)) {
        const sourceUrl = item.sourceUrl.startsWith('http')
          ? item.sourceUrl
          : `${this.baseUrl}${item.sourceUrl}`;
        const sourceId = this.extractSourceId(sourceUrl);

        let product = await this.productRepository.findOne({ where: { sourceId } });
        if (!product) {
          product = this.productRepository.create({
            sourceId,
            categoryId,
            title: item.title,
            author: item.author || null,
            price: parseFloat(item.price) || null,
            currency: 'GBP',
            imageUrl: item.imageUrl,
            sourceUrl,
            lastScrapedAt: new Date(),
          });
        } else {
          product.price = parseFloat(item.price) || product.price;
          product.lastScrapedAt = new Date();
        }

        savedProducts.push(await this.productRepository.save(product));
      }

      // Update category
      category.lastScrapedAt = new Date();
      await this.categoryRepository.save(category);

      await this.updateJobStatus(job.id, ScrapeJobStatus.COMPLETED);
      this.logger.log(`Product scrape completed: ${savedProducts.length} products`);

      return savedProducts;
    } catch (error) {
      this.logger.error(`Product scrape failed: ${error.message}`, error.stack);
      await this.updateJobStatus(job.id, ScrapeJobStatus.FAILED, error.message);
      throw error;
    }
  }

  async scrapeProductDetail(productId: string): Promise<ProductDetail> {
    this.logger.log(`Starting product detail scrape for: ${productId}`);

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    // Check cache
    if (this.isCacheValid(product.lastScrapedAt)) {
      this.logger.log('Using cached product detail');
      const detail = await this.productDetailRepository.findOne({ where: { productId } });
      if (detail) return detail;
    }

    const job = await this.createScrapeJob(
      product.sourceUrl,
      ScrapeTargetType.PRODUCT_DETAIL,
      { productId },
    );

    try {
      await this.updateJobStatus(job.id, ScrapeJobStatus.PROCESSING);

      let productDetail: any = {};
      let reviews: any[] = [];

      const crawler = new PlaywrightCrawler({
        requestHandlerTimeoutSecs: 60,
        maxRequestRetries: this.maxRetries,
        async requestHandler({ page }) {
          await page.waitForLoadState('networkidle');

          // Extract product details
          productDetail = await page.evaluate(() => {
            const descEl = document.querySelector('.description, .product-description, [data-description]');
            const ratingEl = document.querySelector('.rating, [data-rating]');
            const reviewCountEl = document.querySelector('.review-count, [data-review-count]');
            const publisherEl = document.querySelector('.publisher, [data-publisher]');
            const isbnEl = document.querySelector('.isbn, [data-isbn]');
            const pubDateEl = document.querySelector('.publication-date, [data-publication-date]');

            return {
              description: descEl?.textContent?.trim() || '',
              ratingsAvg: parseFloat(ratingEl?.textContent?.trim().replace(/[^\d.]/g, '') || '0'),
              reviewsCount: parseInt(reviewCountEl?.textContent?.trim().replace(/[^\d]/g, '') || '0', 10),
              publisher: publisherEl?.textContent?.trim() || null,
              isbn: isbnEl?.textContent?.trim().replace(/[^\dX]/g, '') || null,
              publicationDate: pubDateEl?.textContent?.trim() || null,
            };
          });

          // Extract reviews
          reviews = await page.$$eval('.review, .review-item, [data-review]', (reviewEls) => {
            return reviewEls.map((el) => {
              const authorEl = el.querySelector('.author, .review-author');
              const ratingEl = el.querySelector('.rating, [data-rating]');
              const textEl = el.querySelector('.text, .review-text, p');

              return {
                author: authorEl?.textContent?.trim() || 'Anonymous',
                rating: parseInt(ratingEl?.textContent?.trim().replace(/[^\d]/g, '') || '0', 10),
                text: textEl?.textContent?.trim() || '',
              };
            });
          });

          // Extract recommendations
          const recommendations = await page.$$eval(
            '.recommended-products a, .related-products a',
            (links) => links.map((link) => link.getAttribute('href')).filter(Boolean),
          );

          productDetail.recommendations = recommendations;
        },
      });

      await crawler.run([product.sourceUrl]);
      await this.delay(this.scrapeDelay);

      // Save product detail
      let detail: ProductDetail | null = await this.productDetailRepository.findOne({ where: { productId } });
      if (!detail) {
        detail = this.productDetailRepository.create({
          productId,
          ...productDetail,
        }) as unknown as ProductDetail;
      } else {
        Object.assign(detail, productDetail);
      }

      const savedDetail = await this.productDetailRepository.save(detail);

      // Save reviews
      await this.reviewRepository.delete({ productId });
      for (const reviewData of reviews) {
        const review = this.reviewRepository.create({
          productId,
          ...reviewData,
          reviewedAt: new Date(),
        });
        await this.reviewRepository.save(review);
      }

      // Update product
      product.lastScrapedAt = new Date();
      await this.productRepository.save(product);

      await this.updateJobStatus(job.id, ScrapeJobStatus.COMPLETED);
      this.logger.log(`Product detail scrape completed for: ${product.title}`);

      return savedDetail;
    } catch (error) {
      this.logger.error(`Product detail scrape failed: ${error.message}`, error.stack);
      await this.updateJobStatus(job.id, ScrapeJobStatus.FAILED, error.message);
      throw error;
    }
  }

  private async createScrapeJob(
    targetUrl: string,
    targetType: ScrapeTargetType,
    metadata?: Record<string, any>,
  ): Promise<ScrapeJob> {
    const job = this.scrapeJobRepository.create({
      targetUrl,
      targetType,
      status: ScrapeJobStatus.PENDING,
      metadata,
    });
    return this.scrapeJobRepository.save(job);
  }

  private async updateJobStatus(
    jobId: string,
    status: ScrapeJobStatus,
    errorLog?: string,
  ): Promise<void> {
    await this.scrapeJobRepository.update(jobId, {
      status,
      startedAt: status === ScrapeJobStatus.PROCESSING ? new Date() : undefined,
      finishedAt: [ScrapeJobStatus.COMPLETED, ScrapeJobStatus.FAILED].includes(status)
        ? new Date()
        : undefined,
      errorLog,
    });
  }

  private isCacheValid(lastScraped: Date): boolean {
    if (!lastScraped) return false;
    const cacheExpiry = new Date(lastScraped.getTime() + this.cacheTtlHours * 60 * 60 * 1000);
    return new Date() < cacheExpiry;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private extractSourceId(url: string): string {
    const match = url.match(/\/([^\/]+)$/);
    return match ? match[1] : url;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
