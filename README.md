<div align="center">

# ⚡ NEXUS COMMERCE
### The God-Tier Full-Stack MERN E-Commerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?logo=redis)](https://redis.io)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://docker.com)

**Production-grade · Multi-seller · Multi-currency · Real-time · Revenue-ready**

[Live Demo](https://nexuscommerce.dev) · [API Docs](https://docs.nexuscommerce.dev) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Prerequisites](#prerequisites)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Project Structure](#project-structure)
9. [API Documentation](#api-documentation)
10. [Frontend Architecture](#frontend-architecture)
11. [Authentication & Security](#authentication--security)
12. [Payment Integration](#payment-integration)
13. [Seller Dashboard](#seller-dashboard)
14. [Admin Panel](#admin-panel)
15. [Search & Filtering](#search--filtering)
16. [Real-time Features](#real-time-features)
17. [Performance](#performance)
18. [Deployment](#deployment)
19. [Testing](#testing)
20. [Contributing](#contributing)
21. [License](#license)

---

## Overview

Nexus Commerce is a production-ready, multi-vendor e-commerce platform built with the MERN stack. It is architected to power a real business — handling thousands of concurrent users, multi-seller storefronts, secure Stripe payments, advanced product search, real-time notifications, and a comprehensive analytics dashboard — right out of the box.

This is not a tutorial project. Every feature is fully implemented, every API is secured, every UI component is pixel-perfect, and the entire system is containerized and deployment-ready on day one.

### What Makes This Different

| Feature | Nexus Commerce | Typical MERN Tutorial |
|---|---|---|
| Authentication | JWT + Refresh rotation + 2FA + OAuth | JWT only |
| Search | Faceted + full-text + autocomplete + Redis | Basic regex search |
| Payments | Stripe + saved cards + Apple/Google Pay | Placeholder |
| Sellers | Multi-vendor + Stripe Connect payouts | Single vendor |
| Real-time | Socket.IO notifications + order tracking | None |
| Caching | Redis multi-layer strategy | None |
| Security | 20+ hardened security layers | Basic helmet |
| Animations | Framer Motion cinematic design system | None |
| Testing | Jest + RTL + Playwright E2E | None |
| DevOps | Docker + CI/CD + Nginx + multi-env | None |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXUS COMMERCE                           │
├────────────────┬────────────────┬───────────────────────────────┤
│  apps/web      │  apps/seller   │  apps/admin                   │
│  React 18      │  React 18      │  React 18                     │
│  Storefront    │  Seller Dash   │  Admin Panel                  │
│  :5173         │  :5174         │  :5175                        │
└───────┬────────┴───────┬────────┴──────────┬────────────────────┘
        │                │                   │
        └────────────────┼───────────────────┘
                         │ REST API + WebSocket
                         ▼
        ┌────────────────────────────────────┐
        │         server/ (Express.js)       │
        │         Node.js 20 · Port 5000     │
        │                                    │
        │  ┌──────────┐  ┌───────────────┐  │
        │  │  Routes  │  │  Middleware   │  │
        │  │  v1 API  │  │  Auth/Sec/Log │  │
        │  └──────────┘  └───────────────┘  │
        │  ┌──────────┐  ┌───────────────┐  │
        │  │Controllers│  │   Services    │  │
        │  │  (20+)   │  │  (10+ logic)  │  │
        │  └──────────┘  └───────────────┘  │
        │  ┌──────────┐  ┌───────────────┐  │
        │  │  Models  │  │  Bull Queues  │  │
        │  │  (20+)   │  │  (Email/Jobs) │  │
        │  └──────────┘  └───────────────┘  │
        └───────┬────────────────────────────┘
                │
     ┌──────────┼──────────────────┐
     │          │                  │
     ▼          ▼                  ▼
┌─────────┐ ┌────────┐    ┌──────────────┐
│ MongoDB │ │ Redis  │    │  Cloudinary  │
│ Atlas   │ │ Cloud  │    │  (Images)    │
│ (Data)  │ │(Cache) │    │  + Stripe    │
└─────────┘ └────────┘    └──────────────┘
```

### Monorepo Structure (Turborepo)

The project uses Turborepo for monorepo management, enabling shared packages, parallel builds, and intelligent caching across all three frontend applications and the backend.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express.js | 4.19 | HTTP framework |
| MongoDB | 7.0 | Primary database |
| Mongoose | 8.4 | ODM |
| Redis | 7.2 | Cache + sessions + queues |
| Socket.IO | 4.7 | Real-time communications |
| Bull | 4.13 | Background job queues |
| Stripe | 16.x | Payment processing |
| Passport.js | 0.7 | OAuth2 (Google, Facebook) |
| Cloudinary | 2.x | Media storage & CDN |
| Nodemailer | 6.9 | Email sending |
| SendGrid | 8.x | Email delivery |
| Winston | 3.13 | Structured logging |
| Helmet | 7.x | Security headers |
| JWT | 9.x | Authentication tokens |
| Bcrypt | 2.4 | Password hashing |
| Speakeasy | 2.x | TOTP 2FA |
| Sharp | 0.33 | Image processing |

### Frontend (Storefront)
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI library |
| Vite | 5.x | Build tool |
| Redux Toolkit | 2.2 | State management |
| RTK Query | 2.x | API data fetching |
| React Router | 6.24 | Client-side routing |
| Framer Motion | 11.x | Animations |
| TailwindCSS | 3.4 | Utility-first CSS |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Stripe.js | 4.x | Payment UI |
| Socket.IO Client | 4.7 | Real-time |
| Recharts | 2.12 | Data visualization |
| i18next | 23.x | Internationalization |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Compose | Containerization |
| Nginx | Reverse proxy + static serving |
| GitHub Actions | CI/CD pipelines |
| Turborepo | Monorepo build system |

---

## Features

### 🛍️ Customer Storefront
- **Cinematic Homepage**: animated hero carousel, flash deals countdown, trending products, brand showcase, personalized recommendations, promotional banners
- **Advanced Product Discovery**: full-text search, 10+ simultaneous filters (price range, category, brand, color, size, rating, availability), smart faceted search with live counts, "Did you mean?" suggestions, URL-shareable filter state
- **Product Detail**: multi-image gallery with zoom, video support, variant selector (color swatches + size pills), quantity control, sticky add-to-cart bar, Q&A section, rich review system with media
- **Smart Cart**: persistent across sessions, real-time inventory validation, coupon codes, shipping estimate, free-shipping progress bar, cross-sell suggestions
- **Smooth Checkout**: 4-step flow (contact → shipping → payment → confirm), guest checkout, saved addresses, multiple payment methods, Apple/Google Pay, order confirmation with confetti
- **User Profile**: order history + tracking, wishlist with price alerts, address book, saved payment methods, loyalty points, referral program, notification preferences, 2FA security

### 🏪 Seller Features
- **Store Setup**: custom storefront URL, store branding, policies, shipping settings, holidays
- **Product Management**: rich product editor with TipTap WYSIWYG, variant builder (define dimensions + combinations), bulk CSV import/export, drag-and-drop image ordering
- **Order Fulfillment**: per-item status workflow, batch shipping, label generation, buyer communication
- **Analytics Dashboard**: revenue charts, order metrics, top products, customer insights, conversion funnel, exportable reports
- **Finance**: earnings summary, payout requests (Stripe Connect), commission breakdown, tax documents
- **Promotions**: coupon creator, flash deal scheduler, featured product boosting

### 👑 Admin Panel
- **Platform Dashboard**: live KPIs, revenue charts, user acquisition, product performance
- **User Management**: ban/unban, role assignment, login history, audit logs
- **Seller Moderation**: application review, verification workflow, suspend/reinstate
- **Content Management**: banner CMS, hero slide editor, category/attribute manager
- **Financial Control**: platform revenue, commission settings, payout management
- **Order Oversight**: all platform orders, refund processing, dispute handling

### 🔒 Security Features
- JWT access tokens (15min) + rotating refresh tokens (7 days, httpOnly cookies)
- Refresh token family tracking (theft detection)
- TOTP two-factor authentication (QR code setup)
- Google + Facebook OAuth2
- Bcrypt password hashing (cost factor 12)
- 20+ security middleware layers (Helmet, CORS, rate limiting, XSS, NoSQL injection, HPP)
- IP-based login anomaly detection
- Email verification + secure password reset
- Stripe webhook signature verification
- Device fingerprinting for trusted devices

### ⚡ Performance Features
- Redis multi-layer caching (products, categories, search, sessions)
- Cursor-based pagination for large datasets
- Virtual scrolling for long product lists
- Code splitting per route
- Image lazy loading + WebP conversion + responsive srcset
- Debounced search with 50ms autocomplete target
- Service Worker + PWA support
- Lighthouse score targets: Performance >90, Accessibility >95, SEO >95

---

## Prerequisites

Ensure you have installed:

```bash
Node.js >= 20.0.0
npm >= 10.0.0
MongoDB >= 7.0 (or MongoDB Atlas account)
Redis >= 7.2 (or Redis Cloud account)
Docker >= 24.0 (optional, for containerized setup)
```

External accounts needed:
- [Stripe](https://stripe.com) — payment processing
- [Cloudinary](https://cloudinary.com) — image/video CDN
- [SendGrid](https://sendgrid.com) — transactional email
- [MongoDB Atlas](https://cloud.mongodb.com) — production database (optional)
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

---

## Getting Started

### Option A — Docker (Recommended, Zero Config)

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-commerce.git
cd nexus-commerce

# Copy environment files
cp server/.env.example server/.env
# Edit server/.env with your Stripe, Cloudinary, SendGrid keys

# Start all services (MongoDB, Redis, API server, web apps)
docker compose up --build

# In another terminal, seed the database
docker compose exec server npm run seed

# Access the applications:
# Storefront:       http://localhost:5173
# Seller Dashboard: http://localhost:5174
# Admin Panel:      http://localhost:5175
# API:              http://localhost:5000
```

### Option B — Manual Setup

```bash
# 1. Clone
git clone https://github.com/yourusername/nexus-commerce.git
cd nexus-commerce

# 2. Install all dependencies (Turborepo handles all workspaces)
npm install

# 3. Set up environment variables
cp server/.env.example server/.env
# Fill in all required values in server/.env

cp apps/web/.env.example apps/web/.env.local
# VITE_API_URL=http://localhost:5000/api/v1
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# VITE_SOCKET_URL=http://localhost:5000

# 4. Start MongoDB and Redis (if running locally)
# macOS: brew services start mongodb-community redis
# Ubuntu: sudo systemctl start mongod redis-server

# 5. Seed the database with demo data
cd server && npm run seed && cd ..

# 6. Start all apps in development mode
npm run dev
# This starts: server (:5000), web (:5173), seller (:5174), admin (:5175)
```

### Default Login Credentials (After Seeding)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@nexuscommerce.com | Admin@123! |
| Seller | seller@example.com | Seller@123! |
| Customer | customer@example.com | Customer@123! |

---

## Environment Variables

### server/.env (Required)

```bash
# ─── Application ──────────────────────────────────────────────────
NODE_ENV=development               # development | production | test
PORT=5000
API_VERSION=v1
FRONTEND_URL=http://localhost:5173
SELLER_DASHBOARD_URL=http://localhost:5174
ADMIN_DASHBOARD_URL=http://localhost:5175
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# ─── Database ─────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/nexus_commerce
# For production: mongodb+srv://user:pass@cluster.mongodb.net/nexus_commerce

# ─── Redis ────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=                    # Leave empty for local, set for production

# ─── JWT Security ─────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<min-256-bit-random-string>
JWT_REFRESH_SECRET=<different-min-256-bit-random-string>
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# ─── Cloudinary ───────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Stripe ───────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...    # From Stripe Dashboard > Webhooks
STRIPE_CONNECT_CLIENT_ID=ca_...    # For multi-vendor payouts

# ─── Email (SendGrid) ─────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Nexus Commerce

# ─── OAuth (Optional) ─────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback

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