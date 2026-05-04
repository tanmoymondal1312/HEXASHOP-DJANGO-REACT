# HEXASHOP — Production-Ready eCommerce

> **Stack:** Next.js 14 (App Router, SSR/ISR) + Django 4.2 (DRF) + PostgreSQL + Redis + Cloudinary

## Quick Start (Docker)

```bash
# 1. Clone and configure environment
cp .env.example .env
# Edit .env with your values (Cloudinary keys, etc.)

# 2. Start all services
docker compose up -d

# 3. Create a superuser
docker compose exec backend python manage.py createsuperuser

# 4. Open in browser
# Frontend:  http://localhost:3000
# API:       http://localhost:8000/api/v1/
# Admin:     http://localhost:8000/admin/
# Flower:    http://localhost:5555
```

## Project Structure

```
HEXASHOP/
├── backend/                   # Django + DRF
│   ├── apps/
│   │   ├── accounts/          # JWT auth, user profiles, addresses
│   │   ├── products/          # Products, categories, brands, reviews
│   │   ├── cart/              # Cart (DB for auth, Redis for guests)
│   │   ├── wishlist/          # Wishlist with optimistic UI
│   │   └── notifications/     # Stock alerts, newsletter (Celery)
│   ├── core/                  # Shared: pagination, cache, permissions
│   ├── hexashop/settings/     # base / development / production
│   └── celery_app.py          # Celery with 4 named queues
│
├── frontend/                  # Next.js 14 App Router
│   └── src/
│       ├── app/               # Pages (SSR/ISR/Client)
│       ├── components/        # Layout, Products, Cart, Search, UI
│       ├── hooks/             # useInfiniteProducts, useWishlist, useDebounce
│       ├── store/             # Zustand (cart + auth)
│       └── lib/               # API client (axios + interceptors)
│
├── nginx/                     # Dev + Production Nginx configs
├── deploy/                    # Systemd service files
├── .github/workflows/         # CI/CD (test → build → deploy)
└── docker-compose.yml
```

## Architecture Highlights

### Backend
- **JWT in HttpOnly cookies** — XSS-safe authentication with refresh token rotation
- **Cursor pagination** — infinite scroll without offset drift
- **Redis caching** — product detail: 1h TTL, category tree: 6h TTL
- **Guest cart in Redis** — merged on login
- **Celery queues** — `emails`, `inventory`, `reporting`, `default`
- **Read replica router** — heavy listing queries routed to replica
- **Axes** — brute-force lockout after 5 failed attempts

### Frontend
- **SSR for product/category pages** — full SEO
- **ISR** — product pages revalidate every 1 hour
- **Zustand** with optimistic cart updates
- **TanStack Query** for server state + infinite scroll
- **Service Worker** — offline fallback, image/API caching
- **JSON-LD** — Product, BreadcrumbList, Website schemas
- **Dynamic metadata** — every page has unique title/description/canonical

### Security
- HSTS, CSP, X-Frame-Options in production
- CSRF protection + SameSite=Lax cookies
- Rate limiting: 100/min anon, 1000/min auth
- SQL injection: Django ORM only
- XSS: React auto-escape + CSP

## Environment Variables

See `.env.example` for all required variables.

## Running Tests

```bash
# Backend
cd backend
pytest --cov

# Frontend unit tests
cd frontend
npm run test

# E2E (Playwright)
cd frontend
npx playwright test
```

## Production Deployment

### Backend (VPS)
```bash
# Copy systemd service files
cp deploy/gunicorn.service /etc/systemd/system/
cp deploy/celery.service /etc/systemd/system/
cp deploy/celery-beat.service /etc/systemd/system/
systemctl enable --now gunicorn celery celery-beat

# Nginx
cp nginx/nginx.prod.conf /etc/nginx/sites-available/hexashop
ln -s /etc/nginx/sites-available/hexashop /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d hexashop.com -d www.hexashop.com
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## Scaling Path

1. **Vertical** — Upgrade VPS RAM/CPU
2. **Horizontal** — Multiple Django servers behind Nginx load balancer
3. **Read replicas** — Set `DATABASE_READ_REPLICA_URL` env var
4. **Redis Cluster** — Update `REDIS_URL` to cluster endpoint
5. **CDN** — All media via Cloudinary; static via Vercel Edge Network

## Monitoring

- **Sentry** — Set `SENTRY_DSN_BACKEND` + `SENTRY_DSN_FRONTEND`
- **Prometheus** — `/metrics` endpoint (django-prometheus)
- **Health check** — `/health/`
- **Celery Flower** — `http://localhost:5555`
# HEXASHOP-DJANGO-REACT
