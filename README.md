# Nexus Commerce

**Production-grade MERN e-commerce platform** — MongoDB · Express · React · Node.js · Redis · Cloudinary · Stripe

[![CI](https://github.com/your-org/nexus-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/nexus-commerce/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

Nexus Commerce is a full-featured, production-ready marketplace platform with:

- **Customer storefront** — React 18 + Vite, dark luxury aesthetic, full PWA support
- **Seller dashboard** — Analytics, inventory, order management, payouts
- **Admin panel** — Platform management, user moderation, content CMS
- **REST API** — Express.js, JWT auth, Redis caching, Stripe payments, Socket.IO real-time

---

## Project Structure

```
nexus-commerce/
├── apps/
│   ├── web/          # Customer storefront (React 18 + Vite)
│   ├── seller/       # Seller dashboard (React 18 + Vite)
│   └── admin/        # Admin panel (React 18 + Vite)
├── server/           # Node.js + Express API
├── packages/
│   ├── shared/       # Shared utilities
│   └── ui/           # Shared component library
├── infrastructure/
│   ├── docker/       # Dockerfiles
│   ├── nginx/        # Nginx config
│   └── scripts/      # Seed script, deploy scripts
└── .github/
    └── workflows/    # CI/CD pipelines
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7.0+
- Redis 7.2+
- npm 9+

### 1. Clone and install

```bash
git clone https://github.com/your-org/nexus-commerce.git
cd nexus-commerce

# Install server dependencies
cd server && npm install && cd ..

# Install web app dependencies
cd apps/web && npm install && cd ../..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your credentials
```

**Required variables:**
```env
MONGODB_URI=mongodb://localhost:27017/nexus_commerce
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-random-secret>
```

**Optional but recommended:**
```env
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
SENDGRID_API_KEY=SG....
```

### 3. Start services (Docker)

```bash
# Start MongoDB and Redis
docker compose -f infrastructure/docker-compose.yml up mongodb redis -d
```

### 4. Seed the database

```bash
node infrastructure/scripts/seed.js
```

This creates:
- 1 superadmin: `superadmin@nexuscommerce.com` / `Admin@123!`
- 10 verified sellers
- 50 customers
- 200 products across 8 categories
- Sample orders, coupons, flash deals, banners

### 5. Start development servers

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — Web storefront
cd apps/web && npm run dev
```

- **Storefront:** http://localhost:5173
- **API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

---

## Architecture

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js 4.19 |
| Database | MongoDB 7 + Mongoose 8 |
| Cache | Redis 7 + ioredis |
| Auth | JWT (access 15m + refresh 7d) + Passport.js |
| Payments | Stripe (PaymentIntents + Connect) |
| Storage | Cloudinary (images + videos) |
| Email | SendGrid + Nodemailer |
| Real-time | Socket.IO 4 |
| Jobs | node-cron |
| Logging | Winston |

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + Vite 5 |
| State | Redux Toolkit 2 + RTK Query |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 11 |
| Forms | React Hook Form 7 + Zod |
| Charts | Recharts |
| PWA | Vite PWA Plugin (Workbox) |

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

### Authentication

```
POST /auth/register          Register new user
POST /auth/login             Login with email/password
POST /auth/logout            Logout (clears refresh token cookie)
POST /auth/refresh-token     Rotate refresh token
POST /auth/forgot-password   Send password reset email
POST /auth/reset-password/:token  Reset password
POST /auth/verify-email/:token    Verify email address
GET  /auth/google            Google OAuth2
GET  /auth/facebook          Facebook OAuth2
POST /auth/2fa/setup         Setup 2FA (returns QR code)
POST /auth/2fa/verify        Enable 2FA
POST /auth/2fa/validate      Validate 2FA during login
```

### Products

```
GET  /products               List products (filtering, pagination, sorting)
GET  /products/featured      Featured products
GET  /products/trending      Trending products
GET  /products/new-arrivals  New arrivals (last 30 days)
GET  /products/flash-deals   Active flash deals
GET  /products/:slug         Single product detail
POST /products               Create product (seller auth)
PUT  /products/:id           Update product
DELETE /products/:id         Soft delete product
POST /products/:id/images    Upload product images
GET  /products/:id/reviews   Product reviews
POST /products/:id/reviews   Submit review (verified purchase)
GET  /products/:id/related   Related products
```

### Cart

```
GET    /cart                 Get cart (auth or session-based)
POST   /cart/items           Add item
PUT    /cart/items/:id       Update quantity
DELETE /cart/items/:id       Remove item
DELETE /cart                 Clear cart
POST   /cart/merge           Merge guest cart on login
POST   /cart/apply-coupon    Apply coupon code
DELETE /cart/coupon          Remove coupon
```

### Orders

```
POST /orders                 Create order + payment intent
GET  /orders/:id             Get order details
GET  /orders/track/:number   Public order tracking
```

### Payments

```
POST /payments/create-payment-intent   Create Stripe PaymentIntent
POST /payments/save-payment-method     Save card for future use
GET  /payments/payment-methods         List saved cards
POST /payments/refund/:orderId         Process refund
POST /payments/webhook                 Stripe webhook handler
```

### Search

```
GET /search                  Full-text search with facets
GET /search/autocomplete     Typeahead suggestions
GET /search/popular          Popular search terms
```

### Users (authenticated)

```
GET    /users/me             Get profile
PUT    /users/me             Update profile
PUT    /users/me/password    Change password
PUT    /users/me/avatar      Upload avatar
GET    /users/me/orders      Order history
GET    /users/me/addresses   Saved addresses
POST   /users/me/addresses   Add address
GET    /users/me/wishlist    Wishlist
POST   /users/me/wishlist/:productId  Add to wishlist
GET    /users/me/notifications  Notifications
GET    /users/me/loyalty     Loyalty points info
```

### Sellers

```
POST /sellers/apply          Apply to become seller
GET  /sellers/me             Own seller profile
PUT  /sellers/me             Update store profile
GET  /sellers/me/products    Own products
GET  /sellers/me/orders      Orders for own products
GET  /sellers/me/analytics/overview  Revenue & order stats
GET  /sellers/:slug          Public store page
GET  /sellers/:slug/products Store products
```

### Admin (admin/superadmin only)

```
GET /admin/dashboard         Platform KPIs
GET /admin/users             All users
PUT /admin/users/:id/ban     Ban/unban user
GET /admin/sellers           All sellers
PUT /admin/sellers/:id/approve  Approve/reject seller
GET /admin/products          All products
GET /admin/orders            All orders
GET /admin/reviews           Reviews for moderation
GET /admin/categories        Category tree
POST /admin/categories       Create category
GET /admin/banners           Promotional banners
GET /admin/analytics/revenue Revenue analytics
```

---

## Security Features

- **Helmet.js** — Comprehensive security headers + CSP
- **JWT rotation** — Short-lived access tokens (15m) + rotating refresh tokens (7d)
- **Token family tracking** — Detects refresh token theft, invalidates entire family
- **Rate limiting** — Per-route limits (auth: 5/15min, general: 100/15min)
- **MongoDB sanitization** — Prevents NoSQL injection
- **XSS protection** — Input sanitization
- **HPP protection** — HTTP parameter pollution prevention
- **bcrypt** — Password hashing with cost factor 12
- **2FA** — TOTP via speakeasy + QR code setup
- **Stripe Radar** — Fraud prevention on payments
- **Webhook verification** — Stripe signature validation

---

## Deployment

### Docker (recommended)

```bash
# Development
docker compose -f infrastructure/docker-compose.yml up -d

# Production
docker compose -f infrastructure/docker-compose.prod.yml up -d
```

### Manual (DigitalOcean / Railway)

1. **MongoDB Atlas** — Create cluster, get connection string
2. **Redis Cloud** — Create instance, get connection URL
3. **Cloudinary** — Create account, get API credentials
4. **Stripe** — Get API keys, configure webhook endpoint
5. **SendGrid** — Verify sender domain, get API key

```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export REDIS_URL=redis://...
# ... (see server/.env.example for full list)

# Build and start
cd apps/web && npm run build
cd server && npm start
```

### Environment Variables

See [`server/.env.example`](server/.env.example) for the complete list of required and optional environment variables.

---

## Testing

```bash
# Server unit + integration tests
cd server && npm test

# Server tests with coverage
cd server && npm run test:coverage

# Web component tests
cd apps/web && npm test
```

---

## Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@nexuscommerce.com | Admin@123! |
| Admin | admin1@nexuscommerce.com | Admin@123! |
| Seller | techub@seller.com | Seller@123! |
| Customer | alice.smith0@example.com | Customer@123! |

---

## License

MIT © Nexus Commerce
# ─── Business Logic ───────────────────────────────────────────────
DEFAULT_COMMISSION_RATE=0.10       # 10% platform commission on sales
MINIMUM_PAYOUT_AMOUNT=50           # Minimum $50 before payout allowed

# ─── Feature Flags ────────────────────────────────────────────────
ENABLE_2FA=true
ENABLE_SOCIAL_AUTH=true
ENABLE_GUEST_CHECKOUT=true
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_FLASH_DEALS=true
ENABLE_LOYALTY_PROGRAM=true
ENABLE_REFERRAL_PROGRAM=true
```

### apps/web/.env.local

```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_MAPS_KEY=              # Optional, for address autocomplete
VITE_SENTRY_DSN=                   # Optional, for error tracking
VITE_GA_MEASUREMENT_ID=            # Optional, for Google Analytics
```

---

## Project Structure

```
nexus-commerce/
├── apps/
│   ├── web/              # Customer-facing storefront (React + Vite)
│   ├── seller/           # Seller management dashboard (React + Vite)
│   └── admin/            # Super-admin control panel (React + Vite)
├── packages/
│   ├── shared/           # Shared constants, validators, and utilities
│   └── ui/               # Shared component library (future)
├── server/               # Express.js REST API + Socket.IO server
│   ├── src/
│   │   ├── config/       # Database, Redis, Cloudinary, Stripe configs
│   │   ├── models/       # 20+ Mongoose models
│   │   ├── routes/       # Versioned API routes (/api/v1/*)
│   │   ├── controllers/  # Request handlers (thin layer)
│   │   ├── services/     # Business logic layer
│   │   ├── middleware/   # Auth, validation, rate limiting, caching
│   │   ├── validators/   # express-validator schemas
│   │   ├── utils/        # ApiError, ApiResponse, asyncHandler, etc.
│   │   ├── jobs/         # Bull queue workers
│   │   └── sockets/      # Socket.IO event handlers
│   └── tests/            # Jest unit + integration + Playwright E2E
├── infrastructure/
│   ├── docker/           # Dockerfiles for each service
│   ├── nginx/            # Production Nginx configuration
│   └── scripts/          # Database seed, deploy scripts
├── .github/
│   └── workflows/        # CI/CD GitHub Actions pipelines
├── docker-compose.yml    # Development environment
├── docker-compose.prod.yml  # Production environment
├── turbo.json            # Turborepo pipeline configuration
└── package.json          # Root workspace package.json
```

---

## API Documentation

### Base URL
```
Development:  http://localhost:5000/api/v1
Production:   https://api.nexuscommerce.dev/api/v1
```

### Response Format

All API responses follow a consistent envelope format:

**Success Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 847,
    "totalPages": 43
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ],
  "statusCode": 422
}
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```
Refresh token is sent as httpOnly cookie automatically.

### Core API Groups

| Group | Base Path | Description |
|---|---|---|
| Auth | `/auth` | Register, login, OAuth, 2FA, password reset |
| Products | `/products` | CRUD, search, reviews, recommendations |
| Categories | `/categories` | Category tree, attributes |
| Brands | `/brands` | Brand management |
| Cart | `/cart` | Cart operations, coupon application |
| Orders | `/orders` | Order lifecycle, tracking |
| Users | `/users` | Profile, addresses, wishlist, loyalty |
| Payments | `/payments` | Stripe integration, refunds |
| Sellers | `/sellers` | Seller dashboard, store management |
| Search | `/search` | Full-text + faceted search |
| Admin | `/admin` | Platform administration |
| Notifications | `/notifications` | In-app notifications |
| Analytics | `/analytics` | Metrics and reporting |
| Upload | `/upload` | File upload endpoints |
| Webhooks | `/webhook` | Stripe webhook handler |

### Example: Product Search with Filters
```http
GET /api/v1/products?q=wireless+headphones
  &category=electronics
  &brand=sony,bose
  &minPrice=50
  &maxPrice=500
  &rating=4
  &inStock=true
  &sort=rating
  &page=1
  &limit=24
```

**Response includes:** products array + facets (available brands, price range,
rating distribution, color options) + didYouMean + totalResults

---

## Frontend Architecture

### State Management (Redux Toolkit)

The frontend uses Redux Toolkit with RTK Query for a clean, predictable data flow:

```
Store
├── auth         — user session, tokens, isAuthenticated
├── cart         — items, coupon, totals (persisted to localStorage)
├── wishlist     — saved products (synced to API on login)
├── filter       — active search/filter state (synced to URL)
├── ui           — drawers, modals, compare list, recently viewed
└── notification — unread count, notification list
```

RTK Query manages all API calls with automatic caching, invalidation, and optimistic updates.

### Routing Strategy

React Router v6 Data Router with:
- Nested layouts (main, user profile, seller dashboard, admin)
- Protected routes with role-based guards
- Lazy-loaded page components
- Pre-fetching on link hover (200ms delay)
- Scroll restoration between pages

### Component Architecture

```
Atomic Design:
atoms/       — Button, Input, Badge, Spinner, Skeleton, Rating
molecules/   — SearchBar, ProductCard, CartItem, AddressCard
organisms/   — Navbar, ProductFilters, CartDrawer, CheckoutStepper
templates/   — PageLayout, DashboardLayout, AuthLayout
pages/       — Full route-level page components
```

### Animation System

Every major interaction has a purposeful Framer Motion animation:

| Interaction | Animation |
|---|---|
| Page navigation | Fade + slide transition |
| Product cards | Image crossfade on hover, overlay slide-up |
| Cart drawer | Slide from right + backdrop blur |
| Add to cart | Button → checkmark → item flies to cart icon |
| Wishlist toggle | Heart fill + particle burst |
| Flash deal timer | Flip clock digits |
| Number counters | Count-up with easing on viewport entry |
| Search dropdown | Height expand with stagger children |
| Filter panel | Smooth height collapse/expand |
| Order timeline | Sequential reveal with line draw animation |
| Order confirmation | Confetti burst |

---

## Authentication & Security

### Token Architecture
```
Login → { accessToken (15min), refreshToken (7 days, httpOnly cookie) }
          ↓
Request with Bearer accessToken
          ↓
accessToken expires → auto-refresh via RTK Query base query
          ↓
Refresh token rotated → new pair issued, old blacklisted in Redis
          ↓
Refresh token theft detected (old used) → entire family invalidated → force login
```

### Security Layers (Applied in Order)
1. Nginx rate limiting (DDoS protection)
2. Helmet.js (15+ security headers)
3. CORS whitelist
4. Express rate limiter (per-endpoint rules)
5. Body size limits
6. HPP (HTTP Parameter Pollution)
7. MongoDB sanitize (NoSQL injection)
8. XSS clean
9. JWT verification
10. Role-based access control
11. Resource ownership validation
12. Stripe webhook signature verification
13. File type whitelist for uploads
14. Input validation (express-validator)
15. Bcrypt password hashing (cost 12)

---

## Payment Integration

### Checkout Flow
```
1. Frontend: user clicks "Place Order"
2. Backend: POST /api/v1/payments/create-payment-intent
   → Creates Stripe PaymentIntent
   → Returns client_secret
3. Frontend: Stripe.js confirmCardPayment(clientSecret)
   → Card details NEVER touch your server (PCI compliant)
4. Stripe: processes payment, sends webhook
5. Backend: webhook handler payment_intent.succeeded
   → Creates order record
   → Reserves inventory
   → Sends confirmation email
   → Awards loyalty points
6. Frontend: polls order status OR receives Socket.IO event
```

### Supported Payment Methods
- Credit/Debit cards (Visa, Mastercard, Amex, Discover)
- Saved cards (Stripe Customer + PaymentMethod)
- Apple Pay (PaymentRequest API)
- Google Pay (PaymentRequest API)

### Seller Payouts (Stripe Connect)
- Sellers connect their Stripe Express account
- Platform holds funds, disburses minus commission on configurable schedule
- Automatic tax reporting (1099) via Stripe

---

## Seller Dashboard

### Onboarding Flow
1. Customer navigates to /become-a-seller
2. Submits seller application (store info + identity documents)
3. Admin reviews and approves/rejects in admin panel
4. Seller receives email notification
5. Approved seller gains access to /seller-dashboard
6. Connects Stripe Express account for payouts
7. Can begin listing products

### Product Listing Capabilities
- Rich text description editor (TipTap with full formatting)
- Up to 10 product images + 3 videos
- Multi-dimensional variant builder:
  ```
  Define dimensions: Color (Red, Blue, Green) × Size (S, M, L)
  → Generates 9 variant combinations
  → Each with: SKU, price modifier, stock, image
  ```
- CSV bulk import with download template
- SEO optimization panel
- Schedule price changes

### Analytics Available to Sellers
- Revenue by day/week/month/year
- Orders count and fulfillment rate
- Per-product revenue, units sold, views, conversion
- Customer repeat rate
- Average order value
- Top geographical markets
- Export all reports as CSV or PDF

---

## Admin Panel

### Platform Management Capabilities

**Users:**
- View all registered users with filters
- View login history and IP addresses
- Ban/unban with reason logging
- Change roles
- Impersonate user (with audit log)

**Sellers:**
- Review seller applications with document preview
- Approve/reject with email notification
- Monitor seller performance metrics
- Suspend stores with reason
- Override commission rates per seller

**Products:**
- Review products pending approval
- Feature/unfeature products
- Moderate reviews (approve/reject/flag)
- Manage categories and their filter attributes
- Manage brands

**Finance:**
- Platform revenue dashboard
- Commission earned breakdown
- Pending vs completed payouts
- Export financial reports
- Configure commission rates globally

**Content:**
- Homepage hero slide manager
- Promotional banner CMS (upload, schedule, link)
- Featured category curation
- Flash deal creator with scheduling

---

## Search & Filtering

### Architecture
```
User types query
    ↓
Debounce 300ms
    ↓
Check Redis cache (30min TTL for autocomplete)
    ↓ (cache miss)
MongoDB $text search + aggregation pipeline
    ↓
Parallel execution:
  - Search results (paginated)
  - Facets aggregation (categories, brands, price range, ratings, colors, sizes)
    with counts reflecting current filter context
  - Spell correction suggestion
  - Synonym expansion
    ↓
Cache results in Redis
    ↓
Return to frontend
    ↓
URL updated with all active filters (shareable links)
    ↓
Framer Motion animated filter panel with live count updates
```

### Performance Targets
- Autocomplete: < 50ms (Redis cache hit)
- Full search: < 200ms (MongoDB index + aggregation)
- Facet calculation: < 150ms (aggregation pipeline)
- Cache hit rate: > 70% for popular queries

---

## Real-time Features

### Socket.IO Events

**Server → Client:**
```javascript
order:status_updated   — Order status changed (e.g., "shipped")
order:item_updated     — Per-item status updated
inventory:low_stock    — Stock fell below threshold (sellers)
notification:new       — New notification arrived
price:updated          — Price changed on wishlisted item
analytics:live_update  — Live stats counter update (admin)
flash_deal:started     — Flash deal began for interested product
```

**Client → Server:**
```javascript
join:order_room        — Subscribe to updates for specific order
join:seller_room       — Seller subscribes to their order events
leave:order_room       — Unsubscribe
```

---

## Performance

### Bundle Optimization
- Initial JS bundle: < 200KB gzipped (code splitting by route)
- Critical fonts: preloaded
- Images: WebP with srcset, lazy loaded
- Vendor chunks: React, Stripe, Recharts separated
- Tree shaking: unused exports eliminated

### Caching Strategy

| Data | Cache | TTL | Invalidation |
|---|---|---|---|
| Product detail | Redis | 10 min | On product update |
| Category tree | Redis | 1 hour | On category change |
| Featured products | Redis | 5 min | On feature toggle |
| Flash deals | Redis | 1 min | On deal update |
| Search autocomplete | Redis | 30 min | Not invalidated (TTL only) |
| Popular searches | Redis | 15 min | TTL only |
| Seller analytics | Redis | 5 min | On order status change |

### Target Lighthouse Scores
| Metric | Target |
|---|---|
| Performance | > 90 |
| Accessibility | > 95 |
| Best Practices | 100 |
| SEO | > 95 |

---

## Deployment

### Production Stack (Recommended)

```
Domain/CDN: Cloudflare (free tier)
Web App: Vercel (apps/web, apps/seller, apps/admin) OR Nginx VPS
API Server: DigitalOcean Droplet ($24/mo) OR Railway ($5+/mo)
Database: MongoDB Atlas M10 ($57/mo) for production
Cache: Redis Cloud 100MB free tier (or Redis on same droplet)
Media: Cloudinary (free 25GB, pay-as-you-grow)
Email: SendGrid (free 100/day, $19.95/mo for 50k)
Payments: Stripe (2.9% + 30¢ per transaction)
```

### DigitalOcean VPS Deployment

```bash
# 1. Create Ubuntu 22.04 Droplet (2GB RAM minimum)

# 2. Install dependencies
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo snap install --classic certbot

# 3. Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 4. Clone and configure
git clone https://github.com/yourusername/nexus-commerce.git /opt/nexus-commerce
cd /opt/nexus-commerce
cp server/.env.example server/.env
# Edit server/.env with production values

# 5. Start with Docker Compose (production)
docker compose -f docker-compose.prod.yml up -d

# 6. Set up Nginx reverse proxy
sudo cp infrastructure/nginx/nginx.conf /etc/nginx/sites-available/nexuscommerce
sudo ln -s /etc/nginx/sites-available/nexuscommerce /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. SSL certificate
sudo certbot --nginx -d nexuscommerce.com -d www.nexuscommerce.com

# 8. Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Vercel Deployment (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy storefront
cd apps/web
vercel --prod
# Set environment variables in Vercel dashboard

# Deploy seller dashboard
cd ../seller
vercel --prod

# Deploy admin panel
cd ../admin
vercel --prod
```

### Railway Deployment (Full-Stack)

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Initialize project
railway init

# Deploy server
railway up --service server

# Add environment variables
railway variables set --service server < server/.env

# Add MongoDB and Redis plugins in Railway dashboard
```

### Environment-Specific Configurations

**Development:**
- Stripe test keys
- Local MongoDB + Redis
- CORS allows localhost
- Verbose logging
- No SSL required

**Staging:**
- Stripe test keys
- MongoDB Atlas (free tier)
- Redis Cloud (free tier)
- CORS limited to staging domain
- Standard logging

**Production:**
- Stripe live keys
- MongoDB Atlas M10+
- Redis Cloud/DigitalOcean Managed
- CORS locked to production domains
- Error-level logging + Sentry
- HTTPS enforced
- Cookie Secure + SameSite=Strict

---

## Testing

### Running Tests

```bash
# Run all tests across monorepo
npm run test

# Backend unit + integration tests
cd server && npm run test

# Backend tests with coverage
cd server && npm run test:coverage

# Watch mode during development
cd server && npm run test:watch

# Frontend component tests
cd apps/web && npm run test

# E2E tests (requires running dev environment)
npm run test:e2e

# E2E tests with UI (Playwright)
npm run test:e2e:ui
```

### Test Structure

**Backend (Jest + Supertest):**
```
server/tests/
├── unit/
│   ├── services/        — auth, payment, search, inventory service tests
│   └── utils/           — ApiError, pagination, validators
└── integration/
    ├── auth.test.js      — full auth flow
    ├── products.test.js  — CRUD + search
    ├── orders.test.js    — order lifecycle
    ├── cart.test.js      — cart operations
    └── payments.test.js  — Stripe mocked
```

**Frontend (Vitest + React Testing Library + MSW):**
```
apps/web/src/__tests__/
├── components/          — Button, Input, ProductCard, CartDrawer
├── pages/               — Home, ProductDetail, Checkout
├── store/               — Redux slices
└── hooks/               — useCart, useAuth, useDebounce
```

**E2E (Playwright):**
```
tests/e2e/
├── guest-checkout.spec.ts
├── auth-flow.spec.ts
├── seller-onboarding.spec.ts
└── admin-workflow.spec.ts
```

### Coverage Targets

| Layer | Lines | Branches |
|---|---|---|
| Services | > 85% | > 75% |
| Controllers | > 80% | > 70% |
| Middleware | > 90% | > 80% |
| Frontend components | > 75% | > 65% |

---

## Available Scripts

### Root (Turborepo)
```bash
npm run dev          # Start all apps + server in parallel
npm run build        # Build all apps for production
npm run lint         # Lint all packages
npm run test         # Run all test suites
npm run format       # Prettier format all files
```

### server/
```bash
npm run dev          # Nodemon dev server with hot reload
npm run start        # Production server
npm run seed         # Seed database with demo data
npm run seed:clean   # Drop all collections before seeding
npm run test         # Jest test suite
npm run test:coverage # Jest with coverage report
npm run lint         # ESLint
```

### apps/web/ (and seller/, admin/)
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run test         # Vitest
npm run lint         # ESLint
npm run analyze      # Bundle size analysis
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the code style (ESLint + Prettier configs provided)
4. Write tests for new functionality
5. Ensure all tests pass: `npm run test`
6. Commit using conventional commits: `feat: add flash deal scheduling`
7. Push and open a Pull Request with a detailed description

### Commit Convention
```
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    formatting (no code change)
refactor: code restructuring
test:     adding/updating tests
chore:    build/config changes
perf:     performance improvements
```

---

## Roadmap

- [ ] React Native mobile app (iOS + Android)
- [ ] Server-Side Rendering with Next.js migration
- [ ] Elasticsearch integration for advanced search
- [ ] AI-powered product recommendations (OpenAI embeddings)
- [ ] Live video shopping feature
- [ ] AR product try-on (WebXR)
- [ ] Subscription products and recurring billing
- [ ] Multi-warehouse inventory management
- [ ] B2B wholesale module
- [ ] Headless CMS integration (Contentful/Sanity)
- [ ] GraphQL API layer

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Built with these incredible open-source projects:
[Express.js](https://expressjs.com) · [React](https://react.dev) · [MongoDB](https://mongodb.com) · [Redis](https://redis.io) · [Stripe](https://stripe.com) · [Framer Motion](https://framer.com/motion) · [TailwindCSS](https://tailwindcss.com) · [Redux Toolkit](https://redux-toolkit.js.org) · [Socket.IO](https://socket.io) · [Turborepo](https://turbo.build)

---

<div align="center">

**Built to ship. Built to scale. Built to win.**

⭐ Star this repo if you find it useful · 🐛 [Report Issues](issues) · 💬 [Discussions](discussions)

</div>