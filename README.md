# AbleSpace Backend API

Production-ready NestJS backend for the AbleSpace Product Data Explorer platform. Provides RESTful APIs for product exploration with real-time web scraping from World of Books.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Scraping System](#scraping-system)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker Support](#docker-support)
- [API Documentation](#api-documentation)

## Features

✅ **RESTful API** - 19 endpoints across 5 modules
✅ **Real-time Web Scraping** - Crawlee + Playwright for on-demand data extraction
✅ **Intelligent Caching** - Database-backed TTL caching (24-hour default)
✅ **Job Queue System** - BullMQ + Redis for async scraping tasks
✅ **Comprehensive Validation** - DTOs with class-validator
✅ **Structured Logging** - Winston with console and file outputs
✅ **Rate Limiting** - Throttler module (100 req/min)
✅ **API Documentation** - Auto-generated Swagger/OpenAPI docs
✅ **Database Relations** - 7 TypeORM entities with proper FK constraints
✅ **Error Handling** - Global exception filters with detailed logging
✅ **Production Ready** - Docker, health checks, environment config

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | NestJS | 10.3+ |
| **Language** | TypeScript | 5.3+ |
| **Database** | PostgreSQL | 16+ |
| **ORM** | TypeORM | 0.3.19+ |
| **Cache/Queue** | Redis + BullMQ | 7+ / 5.1+ |
| **Scraping** | Crawlee + Playwright | 3.7+ / 1.40+ |
| **Logging** | Winston | 3.11+ |
| **Validation** | class-validator | 0.14+ |
| **API Docs** | Swagger/OpenAPI | 7.1+ |
| **Testing** | Jest | 29.7+ |

## Project Structure

```
backend/
├── src/
│   ├── entities/                 # TypeORM entities (7 tables)
│   │   ├── navigation.entity.ts
│   │   ├── category.entity.ts
│   │   ├── product.entity.ts
│   │   ├── product-detail.entity.ts
│   │   ├── review.entity.ts
│   │   ├── scrape-job.entity.ts
│   │   └── view-history.entity.ts
│   │
│   ├── modules/                  # Feature modules
│   │   ├── navigation/
│   │   │   ├── navigation.controller.ts
│   │   │   ├── navigation.service.ts
│   │   │   └── navigation.module.ts
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.module.ts
│   │   ├── product/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.module.ts
│   │   ├── scraping/
│   │   │   ├── scraping.controller.ts
│   │   │   ├── scraping.service.ts      # 486 lines - core scraping logic
│   │   │   └── scraping.module.ts
│   │   └── view-history/
│   │       ├── view-history.controller.ts
│   │       ├── view-history.service.ts
│   │       └── view-history.module.ts
│   │
│   ├── common/                   # Shared utilities
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Auth guards
│   │   └── interceptors/         # Response interceptors
│   │
│   ├── database/
│   │   └── seeds/
│   │       └── seed.ts           # Database seeding script
│   │
│   ├── app.module.ts             # Root module
│   └── main.ts                   # Application entry point
│
├── test/                         # Test files
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── Dockerfile                    # Docker image definition
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** 16+
- **Redis** 7+ (for job queue and caching)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install Playwright browsers (for scraping)
npx playwright install
```

### Database Setup

1. **Create PostgreSQL database:**

```bash
# Using psql
psql -U postgres
CREATE DATABASE ablespace;
\q
```

2. **Configure environment variables:**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

3. **Run database sync:**

TypeORM will auto-sync schema in development mode (configured in `app.module.ts`).

4. **Seed the database (optional):**

```bash
npm run seed
```

This will populate the database with sample data including:
- 5 Navigation items
- 11 Categories (with hierarchical relationships)
- 15 Products
- 15 Product Details
- 16 Reviews
- 8 Scrape Jobs
- 6 View History entries

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=ablespace

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Scraping Configuration
SCRAPE_DELAY_MS=2000              # Delay between requests (ethical scraping)
SCRAPE_MAX_RETRIES=3              # Max retry attempts on failure
SCRAPE_CACHE_TTL_HOURS=24         # Cache validity duration

# Rate Limiting
THROTTLE_TTL=60                   # Time window in seconds
THROTTLE_LIMIT=100                # Max requests per window

# CORS Configuration
CORS_ORIGIN=http://localhost:3000  # Frontend URL

# Application
PORT=3001
NODE_ENV=development
```

## Database Schema

### Entity Relationship Diagram

```
Navigation (1) ──────────── (N) Category
                                 │
                                 ├─ (1) Category.parent (hierarchical)
                                 │
                                 └─ (1) ────────── (N) Product
                                                      │
                                                      ├─ (1:1) ProductDetail
                                                      │
                                                      └─ (1:N) Review

ScrapeJob (standalone - tracks scraping operations)
ViewHistory (standalone - tracks user navigation)
```

### Tables

#### 1. **navigation**
Main navigation headings (Books, Fiction, Non-Fiction, etc.)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Navigation title |
| slug | VARCHAR(255) | URL-friendly slug (unique, indexed) |
| url | TEXT | Source URL |
| lastScrapedAt | TIMESTAMP | Last scrape time (indexed) |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

**Relations:** `OneToMany` → Category

---

#### 2. **category**
Product categories with hierarchical support

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| navigationId | UUID | Foreign key to navigation (indexed) |
| parentId | UUID | Self-reference for hierarchy (indexed) |
| title | VARCHAR(255) | Category name |
| slug | VARCHAR(255) | URL-friendly slug (indexed) |
| url | TEXT | Source URL |
| productCount | INT | Number of products |
| lastScrapedAt | TIMESTAMP | Last scrape time (indexed) |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

**Relations:**
- `ManyToOne` → Navigation (CASCADE delete)
- `ManyToOne` → Category.parent (CASCADE delete)
- `OneToMany` → Category.children
- `OneToMany` → Product

---

#### 3. **product**
Product listings

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| sourceId | VARCHAR(500) | Unique external ID (unique, indexed) |
| categoryId | UUID | Foreign key to category (indexed) |
| title | VARCHAR(500) | Product title |
| author | VARCHAR(255) | Author name |
| price | DECIMAL(10,2) | Price |
| currency | VARCHAR(10) | Currency code (default: GBP) |
| imageUrl | TEXT | Product image URL |
| sourceUrl | TEXT | Original product URL (unique, indexed) |
| lastScrapedAt | TIMESTAMP | Last scrape time (indexed) |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

**Relations:**
- `ManyToOne` → Category (SET NULL on delete)
- `OneToOne` → ProductDetail (CASCADE)
- `OneToMany` → Review (CASCADE)

---

#### 4. **product_detail**
Detailed product information (1:1 with product)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| productId | UUID | Foreign key to product (unique) |
| description | TEXT | Full description |
| specs | JSONB | Product specifications |
| ratingsAvg | DECIMAL(3,2) | Average rating |
| reviewsCount | INT | Number of reviews |
| publisher | VARCHAR(255) | Publisher name |
| isbn | VARCHAR(50) | ISBN number |
| publicationDate | DATE | Publication date |
| recommendations | JSONB | Array of recommended product URLs |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

**Relations:** `OneToOne` → Product (CASCADE delete)

---

#### 5. **review**
Customer reviews

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| productId | UUID | Foreign key to product (indexed) |
| author | VARCHAR(255) | Review author |
| rating | INT | Rating (1-5) |
| text | TEXT | Review content |
| reviewedAt | TIMESTAMP | Review date |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

**Relations:** `ManyToOne` → Product (CASCADE delete)

---

#### 6. **scrape_job**
Scraping job tracking

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| targetUrl | TEXT | URL to scrape |
| targetType | ENUM | Type: navigation, category, product_list, product_detail (indexed) |
| status | ENUM | Status: pending, processing, completed, failed (indexed) |
| startedAt | TIMESTAMP | Job start time |
| finishedAt | TIMESTAMP | Job completion time |
| errorLog | TEXT | Error messages |
| metadata | JSONB | Additional job data |
| createdAt | TIMESTAMP | Record creation |
| updatedAt | TIMESTAMP | Last update |

---

#### 7. **view_history**
User browsing history

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | VARCHAR(255) | User ID (nullable, indexed) |
| sessionId | VARCHAR(255) | Session ID (indexed) |
| pathJson | JSONB | Navigation path data |
| page | VARCHAR(500) | Page URL |
| createdAt | TIMESTAMP | Record creation (indexed) |

---

## API Endpoints

### Navigation Module (3 endpoints)

```http
GET    /navigation              # Get all navigation items
GET    /navigation/:id          # Get navigation by ID
GET    /navigation/slug/:slug   # Get navigation by slug
```

**Example Response:**
```json
{
  "id": "uuid",
  "title": "Fiction",
  "slug": "fiction",
  "url": "https://www.worldofbooks.com/en-gb/books/fiction",
  "lastScrapedAt": "2024-01-15T10:30:00Z",
  "categories": [...]
}
```

---

### Category Module (4 endpoints)

```http
GET    /categories                    # List all categories
GET    /categories?navigationId=uuid  # Filter by navigation
GET    /categories/:id                # Get category by ID
GET    /categories/slug/:slug         # Get category by slug
GET    /categories/:id/children       # Get subcategories
```

**Example Response:**
```json
{
  "id": "uuid",
  "navigationId": "uuid",
  "parentId": null,
  "title": "Crime & Thriller",
  "slug": "crime-thriller",
  "productCount": 1250,
  "children": [...],
  "products": [...]
}
```

---

### Product Module (5 endpoints)

```http
GET    /products                           # List products (paginated)
GET    /products?categoryId=uuid           # Filter by category
GET    /products?search=harry              # Search by title
GET    /products?limit=20&page=1           # Pagination
GET    /products/:id                       # Get product by ID
GET    /products/source/:sourceId          # Get by source ID
GET    /products/:id/detail                # Get product detail
GET    /products/:id/reviews               # Get product reviews
```

**Query Parameters:**
- `categoryId` - Filter by category UUID
- `search` - Search in product titles
- `limit` - Items per page (default: 20)
- `page` - Page number (default: 1)

**Example Response:**
```json
{
  "id": "uuid",
  "sourceId": "wob-978-0-241-95683-6",
  "title": "The Thursday Murder Club",
  "author": "Richard Osman",
  "price": 8.99,
  "currency": "GBP",
  "imageUrl": "https://...",
  "detail": {...},
  "reviews": [...]
}
```

---

### Scraping Module (4 endpoints)

```http
POST   /scraping/navigation                        # Scrape navigation items
POST   /scraping/categories/:navigationId          # Scrape categories
POST   /scraping/products/:categoryId              # Scrape products
POST   /scraping/products/:categoryId?limit=20&page=1
POST   /scraping/product-detail/:productId         # Scrape product details
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/scraping/navigation
```

**Example Response:**
```json
{
  "success": true,
  "message": "Navigation scraped successfully",
  "data": {
    "itemsScraped": 5,
    "cached": 0,
    "newItems": 5
  }
}
```

---

### View History Module (3 endpoints)

```http
POST   /view-history                        # Create view history entry
GET    /view-history/session/:sessionId     # Get by session
GET    /view-history/user/:userId           # Get by user ID
```

**Example POST Body:**
```json
{
  "sessionId": "session-abc-123",
  "userId": "user-456",
  "pathJson": {
    "navigation": "Fiction",
    "category": "Crime & Thriller",
    "product": "The Thursday Murder Club"
  },
  "page": "/products/thursday-murder-club"
}
```

---

## Scraping System

### Architecture

The scraping system uses **Crawlee** with **Playwright** for headless browser automation.

**Key Features:**
- ✅ Ethical scraping with configurable delays (default: 2 seconds)
- ✅ Exponential backoff retry logic (max 3 retries)
- ✅ Smart caching with TTL (24 hours)
- ✅ Deduplication by sourceId and URL
- ✅ Job tracking and logging
- ✅ Multiple selector strategies for robustness

### Scraping Flow

```
User Request
    ↓
Check Cache (lastScrapedAt vs TTL)
    ↓
If cached → Return from DB
    ↓
If stale → Create ScrapeJob (PENDING)
    ↓
Update status → PROCESSING
    ↓
Launch Playwright Crawler
    ↓
Extract data (multiple selectors)
    ↓
Deduplicate & validate
    ↓
Save to database
    ↓
Update status → COMPLETED
    ↓
Return results
```

### Scraping Configuration

```typescript
// src/modules/scraping/scraping.service.ts

const SCRAPE_DELAY = process.env.SCRAPE_DELAY_MS || 2000;
const MAX_RETRIES = process.env.SCRAPE_MAX_RETRIES || 3;
const CACHE_TTL_HOURS = process.env.SCRAPE_CACHE_TTL_HOURS || 24;
```

### Target Selectors

**Navigation:**
```typescript
['nav', 'header', '.navigation', '.menu', '[role="navigation"]']
```

**Categories:**
```typescript
['.category-list', '.categories', '.filter', 'aside', '.sidebar']
```

**Products:**
```typescript
['.product-card', '.product-item', '.book-card', 'article']
```

**Product Details:**
```typescript
{
  description: ['.description', '.summary', '.about'],
  reviews: ['.review', '.customer-review', '.user-review'],
  rating: ['.rating', '.stars', '.score']
}
```

---

## Running the Application

### Development Mode

```bash
# Start with hot-reload
npm run start:dev
```

Access:
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start application |
| `npm run start:dev` | Start with hot-reload |
| `npm run start:debug` | Start with debugger |
| `npm run start:prod` | Start production build |
| `npm run build` | Build for production |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run seed` | Seed database with sample data |
| `npm run migration:generate` | Generate TypeORM migration |
| `npm run migration:run` | Run pending migrations |

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Structure

```
test/
├── app.e2e-spec.ts              # End-to-end tests
└── jest-e2e.json                # E2E Jest config

src/
└── modules/
    └── navigation/
        └── navigation.service.spec.ts   # Unit tests
```

---

## Docker Support

### Build Docker Image

```bash
docker build -t ablespace-backend .
```

### Run with Docker Compose

```bash
# From project root
docker-compose up -d

# Backend will be available at http://localhost:3001
```

### Docker Services

The `docker-compose.yml` includes:
- **postgres** - PostgreSQL 16
- **redis** - Redis 7
- **backend** - NestJS API
- **frontend** - Next.js app

### Health Checks

All services include health checks:

```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## API Documentation

### Swagger/OpenAPI

Interactive API documentation is available at:

```
http://localhost:3001/api
```

Features:
- ✅ All endpoints documented
- ✅ Request/response schemas
- ✅ Try-it-out functionality
- ✅ DTO validation examples
- ✅ Authentication examples (if applicable)

### Generating API Docs

The Swagger docs are auto-generated from NestJS decorators:

```typescript
@Controller('products')
@ApiTags('Products')
export class ProductController {
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Products retrieved' })
  async findAll(@Query() query) {
    // ...
  }
}
```

---

## Logging

### Winston Configuration

Logs are written to:
- **Console**: Colorized output for development
- **File**: `logs/error.log` (errors only)
- **File**: `logs/combined.log` (all logs)

### Log Levels

```typescript
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}
```

### Example Usage

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('ProductService');

logger.log('Fetching products...');
logger.error('Failed to fetch products', error.stack);
logger.warn('Cache expired for product');
logger.debug('Raw scrape data:', data);
```

---

## Error Handling

### Global Exception Filter

All errors are caught and formatted consistently:

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/products/invalid-id"
}
```

### Validation Errors

DTO validation errors return detailed information:

```json
{
  "statusCode": 400,
  "message": [
    "categoryId must be a UUID",
    "limit must be a positive number"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

The API includes throttling to prevent abuse:

**Default Limits:**
- 100 requests per minute per IP
- Configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT`

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

**Rate Limit Exceeded:**
```json
{
  "statusCode": 429,
  "message": "Too Many Requests"
}
```

---

## Security

### Implemented Security Measures

✅ **Input Validation** - DTOs with class-validator
✅ **SQL Injection Prevention** - TypeORM parameterized queries
✅ **CORS** - Configured origin whitelist
✅ **Rate Limiting** - Throttler module
✅ **Environment Variables** - No hardcoded secrets
✅ **Helmet** - Security headers (recommended for production)

### Recommendations for Production

- Enable HTTPS
- Use proper authentication (JWT, OAuth)
- Implement role-based access control
- Set up database connection pooling
- Enable request logging middleware
- Use secrets management (AWS Secrets Manager, Vault)

---

## Troubleshooting

### Database Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check credentials in `.env`
3. Verify database exists: `psql -l`

### Redis Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
1. Ensure Redis is running: `redis-cli ping`
2. Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Playwright Browser Issues

```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**
```bash
npx playwright install
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

---

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update Swagger documentation
4. Follow TypeScript best practices
5. Run linter before committing: `npm run lint`

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- Check the main README in project root
- Review API documentation at `/api` endpoint
- Check logs in `logs/` directory
- Review environment variables configuration

---

**Built with NestJS, TypeORM, and Crawlee**
