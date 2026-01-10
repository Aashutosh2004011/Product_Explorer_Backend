import { DataSource } from 'typeorm';
import { Navigation } from '../../entities/navigation.entity';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { ProductDetail } from '../../entities/product-detail.entity';
import { Review } from '../../entities/review.entity';
import { ScrapeJob, ScrapeJobStatus, ScrapeTargetType } from '../../entities/scrape-job.entity';
import { ViewHistory } from '../../entities/view-history.entity';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../../../.env') });


export async function seed(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');

  const navigationRepo = dataSource.getRepository(Navigation);
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const productDetailRepo = dataSource.getRepository(ProductDetail);
  const reviewRepo = dataSource.getRepository(Review);
  const scrapeJobRepo = dataSource.getRepository(ScrapeJob);
  const viewHistoryRepo = dataSource.getRepository(ViewHistory);

  console.log('🗑️  Clearing existing data...');

  await dataSource.query('DELETE FROM view_history');
  await dataSource.query('DELETE FROM scrape_job');
  await dataSource.query('DELETE FROM review');
  await dataSource.query('DELETE FROM product_detail');
  await dataSource.query('DELETE FROM product');
  await dataSource.query('DELETE FROM category');
  await dataSource.query('DELETE FROM navigation');

  console.log('✅ Existing data cleared');

  // 1. SEED NAVIGATION ITEMS
  console.log('📚 Seeding Navigation items...');
  const navigations = await navigationRepo.save([
    {
      title: 'Books',
      slug: 'books',
      url: 'https://www.worldofbooks.com/en-gb/books',
      lastScrapedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      title: 'Fiction',
      slug: 'fiction',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction',
      lastScrapedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      title: 'Non-Fiction',
      slug: 'non-fiction',
      url: 'https://www.worldofbooks.com/en-gb/books/non-fiction',
      lastScrapedAt: new Date('2024-01-15T11:00:00Z'),
    },
    {
      title: 'Children\'s Books',
      slug: 'childrens-books',
      url: 'https://www.worldofbooks.com/en-gb/books/childrens',
      lastScrapedAt: new Date('2024-01-15T11:30:00Z'),
    },
    {
      title: 'Academic & Educational',
      slug: 'academic-educational',
      url: 'https://www.worldofbooks.com/en-gb/books/academic',
      lastScrapedAt: new Date('2024-01-15T12:00:00Z'),
    },
  ]);
  console.log(`✅ Seeded ${navigations.length} navigation items`);

  // 2. SEED CATEGORIES (with hierarchical relationships)
  console.log('📂 Seeding Categories...');

  // Create main category entries that match navigation items
  // This allows users to click on "Fiction", "Non-Fiction", etc. and see all categories
  const mainCategories = await categoryRepo.save([
    {
      navigationId: navigations[0].id, // Books
      parentId: null,
      title: 'All Books',
      slug: 'books',
      url: 'https://www.worldofbooks.com/en-gb/books',
      productCount: 5000,
      lastScrapedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      navigationId: navigations[1].id, // Fiction
      parentId: null,
      title: 'All Fiction',
      slug: 'fiction',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction',
      productCount: 3800,
      lastScrapedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      navigationId: navigations[2].id, // Non-Fiction
      parentId: null,
      title: 'All Non-Fiction',
      slug: 'non-fiction',
      url: 'https://www.worldofbooks.com/en-gb/books/non-fiction',
      productCount: 1970,
      lastScrapedAt: new Date('2024-01-15T11:00:00Z'),
    },
    {
      navigationId: navigations[3].id, // Children's Books
      parentId: null,
      title: 'All Children\'s Books',
      slug: 'childrens-books',
      url: 'https://www.worldofbooks.com/en-gb/books/childrens',
      productCount: 1600,
      lastScrapedAt: new Date('2024-01-15T11:30:00Z'),
    },
    {
      navigationId: navigations[4].id, // Academic & Educational
      parentId: null,
      title: 'All Academic & Educational',
      slug: 'academic-educational',
      url: 'https://www.worldofbooks.com/en-gb/books/academic',
      productCount: 1200,
      lastScrapedAt: new Date('2024-01-15T12:00:00Z'),
    },
  ]);

  // Fiction subcategories
  const fictionCategories = await categoryRepo.save([
    {
      navigationId: navigations[1].id,
      parentId: mainCategories[1].id, // Child of "All Fiction"
      title: 'Crime & Thriller',
      slug: 'crime-thriller',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/crime-thriller',
      productCount: 1250,
      lastScrapedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      navigationId: navigations[1].id,
      parentId: mainCategories[1].id, // Child of "All Fiction"
      title: 'Science Fiction & Fantasy',
      slug: 'science-fiction-fantasy',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/sci-fi-fantasy',
      productCount: 980,
      lastScrapedAt: new Date('2024-01-15T10:35:00Z'),
    },
    {
      navigationId: navigations[1].id,
      parentId: mainCategories[1].id, // Child of "All Fiction"
      title: 'Romance',
      slug: 'romance',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/romance',
      productCount: 850,
      lastScrapedAt: new Date('2024-01-15T10:40:00Z'),
    },
    {
      navigationId: navigations[1].id,
      parentId: mainCategories[1].id, // Child of "All Fiction"
      title: 'Literary Fiction',
      slug: 'literary-fiction',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/literary',
      productCount: 720,
      lastScrapedAt: new Date('2024-01-15T10:45:00Z'),
    },
  ]);

  // Subcategories for Crime & Thriller
  await categoryRepo.save([
    {
      navigationId: navigations[1].id,
      parentId: fictionCategories[0].id,
      title: 'Detective & Mystery',
      slug: 'detective-mystery',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/crime-thriller/detective',
      productCount: 420,
      lastScrapedAt: new Date('2024-01-15T10:50:00Z'),
    },
    {
      navigationId: navigations[1].id,
      parentId: fictionCategories[0].id,
      title: 'Psychological Thriller',
      slug: 'psychological-thriller',
      url: 'https://www.worldofbooks.com/en-gb/books/fiction/crime-thriller/psychological',
      productCount: 380,
      lastScrapedAt: new Date('2024-01-15T10:55:00Z'),
    },
  ]);

  // Non-Fiction subcategories
  const nonFictionCategories = await categoryRepo.save([
    {
      navigationId: navigations[2].id,
      parentId: mainCategories[2].id, // Child of "All Non-Fiction"
      title: 'Biography & Memoir',
      slug: 'biography-memoir',
      url: 'https://www.worldofbooks.com/en-gb/books/non-fiction/biography',
      productCount: 650,
      lastScrapedAt: new Date('2024-01-15T11:00:00Z'),
    },
    {
      navigationId: navigations[2].id,
      parentId: mainCategories[2].id, // Child of "All Non-Fiction"
      title: 'History',
      slug: 'history',
      url: 'https://www.worldofbooks.com/en-gb/books/non-fiction/history',
      productCount: 780,
      lastScrapedAt: new Date('2024-01-15T11:05:00Z'),
    },
    {
      navigationId: navigations[2].id,
      parentId: mainCategories[2].id, // Child of "All Non-Fiction"
      title: 'Science & Nature',
      slug: 'science-nature',
      url: 'https://www.worldofbooks.com/en-gb/books/non-fiction/science',
      productCount: 540,
      lastScrapedAt: new Date('2024-01-15T11:10:00Z'),
    },
  ]);

  // Children's Books subcategories
  const childrenCategories = await categoryRepo.save([
    {
      navigationId: navigations[3].id,
      parentId: mainCategories[3].id, // Child of "All Children's Books"
      title: 'Picture Books',
      slug: 'picture-books',
      url: 'https://www.worldofbooks.com/en-gb/books/childrens/picture-books',
      productCount: 920,
      lastScrapedAt: new Date('2024-01-15T11:30:00Z'),
    },
    {
      navigationId: navigations[3].id,
      parentId: mainCategories[3].id, // Child of "All Children's Books"
      title: 'Young Adult',
      slug: 'young-adult',
      url: 'https://www.worldofbooks.com/en-gb/books/childrens/young-adult',
      productCount: 680,
      lastScrapedAt: new Date('2024-01-15T11:35:00Z'),
    },
  ]);

  const totalCategories = await categoryRepo.count();
  console.log(`✅ Seeded ${totalCategories} categories`);

  // 3. SEED PRODUCTS
  console.log('📦 Seeding Products...');
  const products = await productRepo.save([
    // Crime & Thriller Products
    {
      sourceId: 'wob-978-0-241-95683-6',
      categoryId: fictionCategories[0].id,
      title: 'The Thursday Murder Club',
      author: 'Richard Osman',
      price: 8.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/richard-osman/thursday-murder-club/GOR010832127',
      lastScrapedAt: new Date('2024-01-15T10:50:00Z'),
    },
    {
      sourceId: 'wob-978-1-408-70948-7',
      categoryId: fictionCategories[0].id,
      title: 'The Girl on the Train',
      author: 'Paula Hawkins',
      price: 7.49,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/paula-hawkins/girl-on-the-train/GOR006932970',
      lastScrapedAt: new Date('2024-01-15T10:52:00Z'),
    },
    {
      sourceId: 'wob-978-0-857-52215-8',
      categoryId: fictionCategories[0].id,
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      price: 6.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/gillian-flynn/gone-girl/GOR003874726',
      lastScrapedAt: new Date('2024-01-15T10:54:00Z'),
    },
    // Sci-Fi & Fantasy Products
    {
      sourceId: 'wob-978-0-261-10235-4',
      categoryId: fictionCategories[1].id,
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      price: 12.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/j-r-r-tolkien/lord-of-the-rings/GOR001176308',
      lastScrapedAt: new Date('2024-01-15T10:35:00Z'),
    },
    {
      sourceId: 'wob-978-1-408-85565-2',
      categoryId: fictionCategories[1].id,
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      price: 9.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/j-k-rowling/harry-potter-philosophers-stone/GOR008234941',
      lastScrapedAt: new Date('2024-01-15T10:36:00Z'),
    },
    {
      sourceId: 'wob-978-0-356-50340-0',
      categoryId: fictionCategories[1].id,
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      price: 8.49,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/patrick-rothfuss/name-of-the-wind/GOR001279286',
      lastScrapedAt: new Date('2024-01-15T10:37:00Z'),
    },
    // Romance Products
    {
      sourceId: 'wob-978-1-405-93772-3',
      categoryId: fictionCategories[2].id,
      title: 'It Ends with Us',
      author: 'Colleen Hoover',
      price: 7.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/colleen-hoover/it-ends-with-us/GOR008854677',
      lastScrapedAt: new Date('2024-01-15T10:40:00Z'),
    },
    {
      sourceId: 'wob-978-0-241-95642-3',
      categoryId: fictionCategories[2].id,
      title: 'The Notebook',
      author: 'Nicholas Sparks',
      price: 6.49,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/nicholas-sparks/the-notebook/GOR001349650',
      lastScrapedAt: new Date('2024-01-15T10:41:00Z'),
    },
    // Biography Products
    {
      sourceId: 'wob-978-0-241-98450-1',
      categoryId: nonFictionCategories[0].id,
      title: 'Becoming',
      author: 'Michelle Obama',
      price: 10.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/michelle-obama/becoming/GOR009919280',
      lastScrapedAt: new Date('2024-01-15T11:00:00Z'),
    },
    {
      sourceId: 'wob-978-0-751-57416-8',
      categoryId: nonFictionCategories[0].id,
      title: 'Spare',
      author: 'Prince Harry',
      price: 14.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/prince-harry/spare/GOR013268293',
      lastScrapedAt: new Date('2024-01-15T11:01:00Z'),
    },
    // History Products
    {
      sourceId: 'wob-978-0-099-59908-6',
      categoryId: nonFictionCategories[1].id,
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      price: 9.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/yuval-noah-harari/sapiens/GOR006808323',
      lastScrapedAt: new Date('2024-01-15T11:05:00Z'),
    },
    {
      sourceId: 'wob-978-0-753-55598-6',
      categoryId: nonFictionCategories[1].id,
      title: 'A Short History of Nearly Everything',
      author: 'Bill Bryson',
      price: 8.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/bill-bryson/short-history-nearly-everything/GOR001284657',
      lastScrapedAt: new Date('2024-01-15T11:06:00Z'),
    },
    // Academic & Educational Products
    {
      sourceId: 'wob-978-0-198-70002-8',
      categoryId: mainCategories[4].id,
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      price: 45.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/thomas-cormen/introduction-algorithms/GOR004532890',
      lastScrapedAt: new Date('2024-01-15T12:00:00Z'),
    },
    {
      sourceId: 'wob-978-0-134-68599-1',
      categoryId: mainCategories[4].id,
      title: 'Biology',
      author: 'Neil A. Campbell',
      price: 52.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/neil-campbell/biology/GOR008945672',
      lastScrapedAt: new Date('2024-01-15T12:05:00Z'),
    },
    {
      sourceId: 'wob-978-0-321-98452-8',
      categoryId: mainCategories[4].id,
      title: 'Essential Mathematics for Economic Analysis',
      author: 'Knut Sydsaeter',
      price: 38.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/knut-sydsaeter/essential-mathematics/GOR007123456',
      lastScrapedAt: new Date('2024-01-15T12:10:00Z'),
    },
    // Children's Books
    {
      sourceId: 'wob-978-0-723-26767-0',
      categoryId: childrenCategories[0].id,
      title: 'The Gruffalo',
      author: 'Julia Donaldson',
      price: 5.99,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/julia-donaldson/the-gruffalo/GOR001198655',
      lastScrapedAt: new Date('2024-01-15T11:30:00Z'),
    },
    {
      sourceId: 'wob-978-0-141-36153-5',
      categoryId: childrenCategories[0].id,
      title: 'The Very Hungry Caterpillar',
      author: 'Eric Carle',
      price: 5.49,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/eric-carle/very-hungry-caterpillar/GOR001352839',
      lastScrapedAt: new Date('2024-01-15T11:31:00Z'),
    },
    {
      sourceId: 'wob-978-1-408-85520-1',
      categoryId: childrenCategories[1].id,
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      price: 7.49,
      currency: 'GBP',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      sourceUrl: 'https://www.worldofbooks.com/en-gb/books/suzanne-collins/hunger-games/GOR003598929',
      lastScrapedAt: new Date('2024-01-15T11:35:00Z'),
    },
  ]);
  console.log(`✅ Seeded ${products.length} products`);

  // 4. SEED PRODUCT DETAILS
  console.log('📝 Seeding Product Details...');
  const productDetails = await productDetailRepo.save([
    {
      productId: products[0].id,
      description: 'Four unlikely friends meet weekly to investigate unsolved murders. In a peaceful retirement village, four unlikely friends meet up once a week to investigate unsolved murders. But when a brutal killing takes place on their very doorstep, the Thursday Murder Club find themselves in the middle of their first live case.',
      specs: {
        format: 'Paperback',
        pages: 400,
        language: 'English',
        dimensions: '198 x 129 x 25 mm',
      },
      ratingsAvg: 4.5,
      reviewsCount: 1250,
      publisher: 'Penguin Books',
      isbn: '978-0-241-95683-0',
      publicationDate: new Date('2020-09-03'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/richard-osman/man-who-died-twice/GOR012345678',
        'https://www.worldofbooks.com/en-gb/books/richard-osman/bullet-that-missed/GOR012345679',
      ],
    },
    {
      productId: products[1].id,
      description: 'Rachel catches the same commuter train every morning. She knows it will wait at the same signal each time, overlooking a row of back gardens. She\'s even started to feel like she knows the people who live in one of the houses. But then she sees something shocking. It\'s only a minute until the train moves on, but now everything is changed.',
      specs: {
        format: 'Paperback',
        pages: 336,
        language: 'English',
        dimensions: '198 x 129 x 21 mm',
      },
      ratingsAvg: 4.2,
      reviewsCount: 2450,
      publisher: 'Transworld Publishers',
      isbn: '978-1-408-70948-7',
      publicationDate: new Date('2015-01-13'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/paula-hawkins/into-the-water/GOR008456789',
      ],
    },
    {
      productId: products[2].id,
      description: 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy\'s fifth wedding anniversary. But Amy has disappeared. Under mounting pressure, Nick\'s portrait of a happy union begins to crumble. Soon his lies and strange behavior have everyone asking the same dark question: Did Nick Dunne kill his wife?',
      specs: {
        format: 'Paperback',
        pages: 512,
        language: 'English',
        dimensions: '198 x 129 x 32 mm',
      },
      ratingsAvg: 4.3,
      reviewsCount: 3200,
      publisher: 'Weidenfeld & Nicolson',
      isbn: '978-0-857-52215-8',
      publicationDate: new Date('2012-06-05'),
      recommendations: [],
    },
    {
      productId: products[3].id,
      description: 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths, and Sauron, the Dark Lord, forged the One Ring, filling it with his own power so that he could rule all others.',
      specs: {
        format: 'Paperback',
        pages: 1178,
        language: 'English',
        dimensions: '198 x 129 x 51 mm',
      },
      ratingsAvg: 4.8,
      reviewsCount: 5800,
      publisher: 'HarperCollins',
      isbn: '978-0-261-10235-4',
      publicationDate: new Date('1954-07-29'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/j-r-r-tolkien/the-hobbit/GOR001176307',
        'https://www.worldofbooks.com/en-gb/books/j-r-r-tolkien/silmarillion/GOR001176309',
      ],
    },
    {
      productId: products[4].id,
      description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle. Then, on Harry\'s eleventh birthday, a great beetle-eyed giant of a man called Rubeus Hagrid bursts in with some astonishing news: Harry Potter is a wizard.',
      specs: {
        format: 'Paperback',
        pages: 352,
        language: 'English',
        dimensions: '198 x 129 x 23 mm',
      },
      ratingsAvg: 4.9,
      reviewsCount: 8500,
      publisher: 'Bloomsbury Publishing',
      isbn: '978-1-408-85565-2',
      publicationDate: new Date('1997-06-26'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/j-k-rowling/harry-potter-chamber-secrets/GOR008234942',
      ],
    },
    {
      productId: products[5].id,
      description: 'Told in Kvothe\'s own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen. A high-action story written with a poet\'s hand, The Name of the Wind is a masterpiece that will transport readers into the body and mind of a wizard.',
      specs: {
        format: 'Paperback',
        pages: 672,
        language: 'English',
        dimensions: '198 x 129 x 42 mm',
      },
      ratingsAvg: 4.6,
      reviewsCount: 3400,
      publisher: 'Gollancz',
      isbn: '978-0-356-50340-0',
      publicationDate: new Date('2007-03-27'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/patrick-rothfuss/wise-mans-fear/GOR003456789',
      ],
    },
    {
      productId: products[6].id,
      description: 'Lily hasn\'t always had it easy, but that\'s never stopped her from working hard for the life she wants. She\'s come a long way from the small town where she grew up—she graduated from college, moved to Boston, and started her own business. When she meets neurosurgeon Ryle Kincaid, everything in her life seems almost too good to be true.',
      specs: {
        format: 'Paperback',
        pages: 384,
        language: 'English',
        dimensions: '198 x 129 x 24 mm',
      },
      ratingsAvg: 4.4,
      reviewsCount: 4200,
      publisher: 'Simon & Schuster',
      isbn: '978-1-405-93772-3',
      publicationDate: new Date('2016-08-02'),
      recommendations: [],
    },
    {
      productId: products[7].id,
      description: 'Every so often a love story captures our hearts and becomes more than just a story - it becomes an experience to treasure and to share. The Notebook is such a book. It is a celebration of how passion can be ageless and timeless, tales that moves us to laughter and tears and makes us believe in true love all over again.',
      specs: {
        format: 'Paperback',
        pages: 214,
        language: 'English',
        dimensions: '198 x 129 x 14 mm',
      },
      ratingsAvg: 4.3,
      reviewsCount: 2800,
      publisher: 'Sphere',
      isbn: '978-0-241-95642-3',
      publicationDate: new Date('1996-10-01'),
      recommendations: [],
    },
    {
      productId: products[8].id,
      description: 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States. In a life filled with meaning and accomplishment, Michelle Obama has emerged as one of the most iconic and compelling women of our era. As First Lady she helped create the most welcoming and inclusive White House in history.',
      specs: {
        format: 'Hardback',
        pages: 448,
        language: 'English',
        dimensions: '240 x 162 x 43 mm',
      },
      ratingsAvg: 4.7,
      reviewsCount: 6200,
      publisher: 'Viking',
      isbn: '978-0-241-98450-1',
      publicationDate: new Date('2018-11-13'),
      recommendations: [],
    },
    {
      productId: products[9].id,
      description: 'It was one of the most searing images of the twentieth century: two young boys, two princes, walking behind their mother\'s coffin as the world watched in sorrow—and horror. As Diana, Princess of Wales, was laid to rest, billions wondered what the princes must be thinking and feeling—and how their lives would play out from that point on.',
      specs: {
        format: 'Hardback',
        pages: 416,
        language: 'English',
        dimensions: '240 x 156 x 40 mm',
      },
      ratingsAvg: 4.1,
      reviewsCount: 3800,
      publisher: 'Transworld Publishers',
      isbn: '978-0-751-57416-8',
      publicationDate: new Date('2023-01-10'),
      recommendations: [],
    },
    {
      productId: products[10].id,
      description: 'Planet Earth is 4.5 billion years old. In just a fraction of that time, one species among countless others has conquered it. Us. We are the most advanced and most destructive animals ever to have lived. What makes us brilliant? What makes us deadly? What makes us Sapiens? In this bold and provocative book, Yuval Noah Harari explores who we are, how we got here and where we\'re going.',
      specs: {
        format: 'Paperback',
        pages: 512,
        language: 'English',
        dimensions: '198 x 129 x 32 mm',
      },
      ratingsAvg: 4.6,
      reviewsCount: 7500,
      publisher: 'Vintage',
      isbn: '978-0-099-59908-6',
      publicationDate: new Date('2014-09-04'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/yuval-noah-harari/homo-deus/GOR008234567',
      ],
    },
    {
      productId: products[11].id,
      description: 'Bill Bryson describes himself as a reluctant traveller: but even when he stays safely in his own study at home, he can\'t contain his curiosity about the world around him. A Short History of Nearly Everything is his quest to find out everything that has happened from the Big Bang to the rise of civilization - how we got from there, being nothing at all, to here, being us.',
      specs: {
        format: 'Paperback',
        pages: 688,
        language: 'English',
        dimensions: '198 x 129 x 43 mm',
      },
      ratingsAvg: 4.5,
      reviewsCount: 4900,
      publisher: 'Black Swan',
      isbn: '978-0-753-55598-6',
      publicationDate: new Date('2003-05-06'),
      recommendations: [],
    },
    // Academic & Educational Product Details
    {
      productId: products[12].id,
      description: 'This title covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers. Each chapter is relatively self-contained and can be used as a unit of study. The algorithms are described in English and in a pseudocode designed to be readable by anyone who has done a little programming.',
      specs: {
        format: 'Hardcover',
        pages: 1312,
        language: 'English',
        dimensions: '235 x 191 x 51 mm',
      },
      ratingsAvg: 4.7,
      reviewsCount: 2100,
      publisher: 'MIT Press',
      isbn: '978-0-198-70002-8',
      publicationDate: new Date('2009-07-31'),
      recommendations: [],
    },
    {
      productId: products[13].id,
      description: 'For the Ninth Edition of this best-selling text, the authors have restructured each chapter around a framework of five key concepts: organization, information, energy and matter, interactions, and evolution. Campbell Biology helps launch students to success in biology through its clear and engaging narrative, superior pedagogy, and innovative use of art and photos to promote student learning.',
      specs: {
        format: 'Hardcover',
        pages: 1488,
        language: 'English',
        dimensions: '279 x 221 x 51 mm',
      },
      ratingsAvg: 4.5,
      reviewsCount: 1850,
      publisher: 'Pearson',
      isbn: '978-0-134-68599-1',
      publicationDate: new Date('2016-10-05'),
      recommendations: [],
    },
    {
      productId: products[14].id,
      description: 'Essential Mathematics for Economic Analysis is an invaluable introduction to the mathematical tools that undergraduate economists need. The fundamental ideas of mathematics are explained in the context of applications in economics and business. This book is ideal for first and second year undergraduates enrolled on economics degree programmes.',
      specs: {
        format: 'Paperback',
        pages: 744,
        language: 'English',
        dimensions: '246 x 189 x 35 mm',
      },
      ratingsAvg: 4.3,
      reviewsCount: 980,
      publisher: 'Pearson',
      isbn: '978-0-321-98452-8',
      publicationDate: new Date('2016-02-18'),
      recommendations: [],
    },
    // Children's Books Product Details
    {
      productId: products[15].id,
      description: 'A mouse took a stroll through the deep dark wood. A fox saw the mouse and the mouse looked good. Walk further into the deep dark wood, and discover what happens when a quick-thinking mouse comes face to face with a fox, an owl, a snake... and a hungry Gruffalo!',
      specs: {
        format: 'Paperback',
        pages: 32,
        language: 'English',
        dimensions: '250 x 250 x 5 mm',
      },
      ratingsAvg: 4.8,
      reviewsCount: 3200,
      publisher: 'Macmillan Children\'s Books',
      isbn: '978-0-723-26767-0',
      publicationDate: new Date('1999-03-23'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/julia-donaldson/gruffalos-child/GOR001198656',
      ],
    },
    {
      productId: products[16].id,
      description: 'The all-time classic picture book, from generation to generation, sold somewhere in the world every 30 seconds! Have you shared it with a child or grandchild in your life? For the first time, Eric Carle\'s The Very Hungry Caterpillar is now available in e-book format, perfect for storytime anywhere.',
      specs: {
        format: 'Board Book',
        pages: 26,
        language: 'English',
        dimensions: '180 x 130 x 13 mm',
      },
      ratingsAvg: 4.9,
      reviewsCount: 5600,
      publisher: 'Puffin',
      isbn: '978-0-141-36153-5',
      publicationDate: new Date('1969-06-03'),
      recommendations: [],
    },
    {
      productId: products[17].id,
      description: 'Sixteen-year-old Katniss Everdeen regards it as a death sentence when she is forced to represent her district in the annual Hunger Games, a fight to the death on live TV. But Katniss has been close to death before - and survival, for her, is second nature. The Hunger Games is a searing novel set in a future with unsettling parallels to our present.',
      specs: {
        format: 'Paperback',
        pages: 458,
        language: 'English',
        dimensions: '198 x 129 x 29 mm',
      },
      ratingsAvg: 4.6,
      reviewsCount: 6800,
      publisher: 'Scholastic',
      isbn: '978-1-408-85520-1',
      publicationDate: new Date('2008-09-14'),
      recommendations: [
        'https://www.worldofbooks.com/en-gb/books/suzanne-collins/catching-fire/GOR003598930',
        'https://www.worldofbooks.com/en-gb/books/suzanne-collins/mockingjay/GOR003598931',
      ],
    },
  ]);
  console.log(`✅ Seeded ${productDetails.length} product details`);

  // 5. SEED REVIEWS
  console.log('⭐ Seeding Reviews...');
  const reviews = await reviewRepo.save([
    // Reviews for The Thursday Murder Club
    {
      productId: products[0].id,
      author: 'BookLover123',
      rating: 5,
      text: 'Absolutely brilliant! A perfect blend of mystery, humor, and heart. The characters are wonderfully developed and the plot keeps you guessing.',
      reviewedAt: new Date('2024-01-10T14:30:00Z'),
    },
    {
      productId: products[0].id,
      author: 'MysteryFan',
      rating: 4,
      text: 'Really enjoyed this cozy mystery. The elderly sleuths are charming and the writing is witty. Can\'t wait to read the next in the series.',
      reviewedAt: new Date('2024-01-12T09:15:00Z'),
    },
    {
      productId: products[0].id,
      author: 'SarahJ',
      rating: 5,
      text: 'One of the best books I\'ve read this year. Laugh-out-loud funny in places and genuinely touching in others.',
      reviewedAt: new Date('2024-01-14T16:45:00Z'),
    },
    // Reviews for The Girl on the Train
    {
      productId: products[1].id,
      author: 'ThrillerAddict',
      rating: 4,
      text: 'Gripping psychological thriller that kept me up all night. The unreliable narrator adds to the tension.',
      reviewedAt: new Date('2024-01-08T11:20:00Z'),
    },
    {
      productId: products[1].id,
      author: 'ReadingNook',
      rating: 5,
      text: 'Couldn\'t put it down! The twists and turns are expertly crafted. Paula Hawkins is a master storyteller.',
      reviewedAt: new Date('2024-01-11T13:00:00Z'),
    },
    // Reviews for Lord of the Rings
    {
      productId: products[3].id,
      author: 'FantasyReader',
      rating: 5,
      text: 'The ultimate fantasy epic. Tolkien created a world so rich and detailed, it feels real. A timeless masterpiece.',
      reviewedAt: new Date('2024-01-05T10:30:00Z'),
    },
    {
      productId: products[3].id,
      author: 'EpicTales',
      rating: 5,
      text: 'Read it for the fifth time and still discovering new layers. The depth of world-building is unmatched.',
      reviewedAt: new Date('2024-01-09T15:45:00Z'),
    },
    {
      productId: products[3].id,
      author: 'AdventureSeeker',
      rating: 4,
      text: 'A challenging read at times with all the songs and descriptions, but ultimately rewarding. The journey is worth it.',
      reviewedAt: new Date('2024-01-13T12:00:00Z'),
    },
    // Reviews for Harry Potter
    {
      productId: products[4].id,
      author: 'PotterHead',
      rating: 5,
      text: 'The book that started it all! Still magical after all these years. Perfect for readers of all ages.',
      reviewedAt: new Date('2024-01-06T14:00:00Z'),
    },
    {
      productId: products[4].id,
      author: 'MagicLover',
      rating: 5,
      text: 'Rowling\'s imagination knows no bounds. Hogwarts feels like home. Can\'t recommend this enough!',
      reviewedAt: new Date('2024-01-10T16:30:00Z'),
    },
    // Reviews for Sapiens
    {
      productId: products[10].id,
      author: 'HistoryBuff',
      rating: 5,
      text: 'Mind-blowing perspective on human history. Harari makes complex ideas accessible and engaging.',
      reviewedAt: new Date('2024-01-07T11:00:00Z'),
    },
    {
      productId: products[10].id,
      author: 'ThinkingReader',
      rating: 4,
      text: 'Fascinating read that challenges many assumptions. Some controversial points but overall excellent.',
      reviewedAt: new Date('2024-01-12T14:20:00Z'),
    },
    // Reviews for The Gruffalo
    {
      productId: products[12].id,
      author: 'ParentReader',
      rating: 5,
      text: 'My kids love this book! The rhyming is delightful and the illustrations are fantastic.',
      reviewedAt: new Date('2024-01-09T09:00:00Z'),
    },
    {
      productId: products[12].id,
      author: 'Grandma2024',
      rating: 5,
      text: 'Perfect bedtime story. My grandchildren never tire of hearing about the Gruffalo.',
      reviewedAt: new Date('2024-01-11T19:30:00Z'),
    },
    // Reviews for The Hunger Games
    {
      productId: products[14].id,
      author: 'YAFan',
      rating: 5,
      text: 'Dystopian masterpiece. Katniss is one of the best protagonists in YA literature.',
      reviewedAt: new Date('2024-01-08T13:45:00Z'),
    },
    {
      productId: products[14].id,
      author: 'TeenReader',
      rating: 5,
      text: 'Action-packed and thought-provoking. Couldn\'t stop reading until I finished the entire trilogy!',
      reviewedAt: new Date('2024-01-13T17:00:00Z'),
    },
  ]);
  console.log(`✅ Seeded ${reviews.length} reviews`);

  // 6. SEED SCRAPE JOBS
  console.log('🔍 Seeding Scrape Jobs...');
  const scrapeJobs = await scrapeJobRepo.save([
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb',
      targetType: ScrapeTargetType.NAVIGATION,
      status: ScrapeJobStatus.COMPLETED,
      startedAt: new Date('2024-01-15T10:00:00Z'),
      finishedAt: new Date('2024-01-15T10:02:30Z'),
      errorLog: null,
      metadata: {
        itemsScraped: 5,
        duration: 150,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/fiction',
      targetType: ScrapeTargetType.CATEGORY,
      status: ScrapeJobStatus.COMPLETED,
      startedAt: new Date('2024-01-15T10:30:00Z'),
      finishedAt: new Date('2024-01-15T10:33:15Z'),
      errorLog: null,
      metadata: {
        itemsScraped: 4,
        duration: 195,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/fiction/crime-thriller',
      targetType: ScrapeTargetType.PRODUCT_LIST,
      status: ScrapeJobStatus.COMPLETED,
      startedAt: new Date('2024-01-15T10:50:00Z'),
      finishedAt: new Date('2024-01-15T10:54:20Z'),
      errorLog: null,
      metadata: {
        itemsScraped: 3,
        duration: 260,
        page: 1,
        limit: 20,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/richard-osman/thursday-murder-club/GOR010832127',
      targetType: ScrapeTargetType.PRODUCT_DETAIL,
      status: ScrapeJobStatus.COMPLETED,
      startedAt: new Date('2024-01-15T11:00:00Z'),
      finishedAt: new Date('2024-01-15T11:01:45Z'),
      errorLog: null,
      metadata: {
        reviewsScraped: 3,
        recommendationsFound: 2,
        duration: 105,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/non-fiction',
      targetType: ScrapeTargetType.CATEGORY,
      status: ScrapeJobStatus.COMPLETED,
      startedAt: new Date('2024-01-15T11:00:00Z'),
      finishedAt: new Date('2024-01-15T11:02:30Z'),
      errorLog: null,
      metadata: {
        itemsScraped: 3,
        duration: 150,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/fiction/sci-fi-fantasy',
      targetType: ScrapeTargetType.PRODUCT_LIST,
      status: ScrapeJobStatus.PROCESSING,
      startedAt: new Date('2024-01-15T12:00:00Z'),
      finishedAt: null,
      errorLog: null,
      metadata: {
        currentProgress: '45%',
        page: 1,
        limit: 20,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/invalid-page',
      targetType: ScrapeTargetType.PRODUCT_LIST,
      status: ScrapeJobStatus.FAILED,
      startedAt: new Date('2024-01-15T11:30:00Z'),
      finishedAt: new Date('2024-01-15T11:30:45Z'),
      errorLog: 'Error: Page not found (404). The requested URL returned a 404 status code.',
      metadata: {
        errorCode: 404,
        retryAttempts: 3,
      },
    },
    {
      targetUrl: 'https://www.worldofbooks.com/en-gb/books/childrens',
      targetType: ScrapeTargetType.CATEGORY,
      status: ScrapeJobStatus.PENDING,
      startedAt: null,
      finishedAt: null,
      errorLog: null,
      metadata: {
        queuePosition: 2,
        estimatedStartTime: '2024-01-15T12:30:00Z',
      },
    },
  ]);
  console.log(`✅ Seeded ${scrapeJobs.length} scrape jobs`);

  // 7. SEED VIEW HISTORY
  console.log('👀 Seeding View History...');
  const viewHistory = await viewHistoryRepo.save([
    {
      userId: null,
      sessionId: 'session-abc-123-def-456',
      pathJson: {
        navigation: 'Fiction',
        category: 'Crime & Thriller',
        product: null,
      },
      page: '/categories/crime-thriller',
      createdAt: new Date('2024-01-15T14:00:00Z'),
    },
    {
      userId: null,
      sessionId: 'session-abc-123-def-456',
      pathJson: {
        navigation: 'Fiction',
        category: 'Crime & Thriller',
        product: 'The Thursday Murder Club',
      },
      page: '/products/the-thursday-murder-club',
      createdAt: new Date('2024-01-15T14:05:00Z'),
    },
    {
      userId: 'user-789',
      sessionId: 'session-xyz-789-uvw-012',
      pathJson: {
        navigation: 'Fiction',
        category: 'Science Fiction & Fantasy',
        product: null,
      },
      page: '/categories/science-fiction-fantasy',
      createdAt: new Date('2024-01-15T14:10:00Z'),
    },
    {
      userId: 'user-789',
      sessionId: 'session-xyz-789-uvw-012',
      pathJson: {
        navigation: 'Fiction',
        category: 'Science Fiction & Fantasy',
        product: 'Harry Potter and the Philosopher\'s Stone',
      },
      page: '/products/harry-potter-philosophers-stone',
      createdAt: new Date('2024-01-15T14:15:00Z'),
    },
    {
      userId: null,
      sessionId: 'session-lmn-456-opq-789',
      pathJson: {
        navigation: 'Children\'s Books',
        category: 'Picture Books',
        product: 'The Gruffalo',
      },
      page: '/products/the-gruffalo',
      createdAt: new Date('2024-01-15T14:20:00Z'),
    },
    {
      userId: 'user-456',
      sessionId: 'session-rst-123-uvw-456',
      pathJson: {
        navigation: 'Non-Fiction',
        category: 'History',
        product: 'Sapiens: A Brief History of Humankind',
      },
      page: '/products/sapiens',
      createdAt: new Date('2024-01-15T14:25:00Z'),
    },
  ]);
  console.log(`✅ Seeded ${viewHistory.length} view history entries`);

  // Summary
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════');
  console.log(`📚 Navigation items:    ${navigations.length}`);
  console.log(`📂 Categories:          ${totalCategories}`);
  console.log(`📦 Products:            ${products.length}`);
  console.log(`📝 Product Details:     ${productDetails.length}`);
  console.log(`⭐ Reviews:             ${reviews.length}`);
  console.log(`🔍 Scrape Jobs:         ${scrapeJobs.length}`);
  console.log(`👀 View History:        ${viewHistory.length}`);
  console.log('═══════════════════════════════════════════');
  console.log('✅ All data seeded successfully!');
}

// If running directly (not imported)
if (require.main === module) {
  import('typeorm').then(async ({ DataSource }) => {
    

    const AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'ablespace',
      entities: [
        __dirname + '/../../entities/*.entity{.ts,.js}',
      ],
      synchronize: true,
    });

    try {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');

      await seed(AppDataSource);

      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      process.exit(1);
    }
  });
}
