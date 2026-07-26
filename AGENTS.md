# AGENTS.md — HEXASHOP Development Guide

## Quick Reference

```bash
# Backend (from backend/)
source venv/bin/activate
python manage.py runserver

# Frontend (from frontend/)
npm run dev
```

## Project Structure

```
HEXASHOP/
├── backend/                   # Django 4.2 + DRF API
│   ├── apps/                  # 8 Django apps (accounts, products, cart, etc.)
│   ├── core/                  # Shared: pagination, cache, permissions, db_router
│   ├── hexashop/settings/     # base.py, development.py, production.py
│   └── celery_app.py          # 4 named queues: emails, inventory, reporting, default
│
├── frontend/                  # Next.js 14 (App Router) + TypeScript
│   └── src/
│       ├── app/               # Pages (SSR/ISR/Client)
│       ├── components/        # Layout, Products, Cart, Search, UI, Studio
│       ├── hooks/             # useInfiniteProducts, useWishlist, useDebounce
│       ├── store/             # Zustand: cartStore.ts, authStore.ts
│       ├── lib/               # api.ts (axios + JWT refresh interceptor)
│       └── types/             # index.ts, hero.ts
│
├── nginx/                     # Dev + Production Nginx configs
├── deploy/                    # Systemd service files
└── docker-compose.yml         # 7 services: db, redis, backend, celery_worker, celery_beat, flower, frontend, nginx
```

## Development Commands

### Backend

```bash
cd backend

# Lint & format
black .
isort .
flake8 . --max-line-length=100 --exclude=migrations

# Tests
pytest --cov
pytest tests/test_products.py::TestProductList -k "test_list_active"  # single test

# Migrations
python manage.py makemigrations <app_name>
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend

```bash
cd frontend

# Lint & format
npm run lint
npm run lint:fix
npm run format

# Type check
npm run type-check

# Tests
npm run test              # unit (vitest)
npm run test:watch        # watch mode
npm run test:e2e          # E2E (playwright)
npx playwright test       # run playwright directly

# Build
npm run build
```

### Docker

```bash
docker compose up -d              # start all services
docker compose up -d db redis     # start only db + redis
docker compose ps                 # check status
docker compose logs -f backend    # follow backend logs
docker compose down               # stop all
```

## Key Architecture Decisions

### Backend

- **Auth**: JWT in HttpOnly cookies (`access_token`, `refresh_token`). Auth class: `CookieJWTAuthentication` at `backend/apps/accounts/authentication.py`.
- **User model**: `accounts.User` with UUID PK, email as `USERNAME_FIELD`.
- **Pagination**: Cursor-based (`CursorSetPagination`) for infinite scroll, page size 24.
- **Cache**: Redis with TTLs — product detail 1h, category tree 6h, search suggest 5min.
- **Cart**: DB-backed for authenticated users, Redis session key for guests.
- **Celery**: Named queues route tasks to specific workers.
- **Read replica**: Optional `DATABASE_READ_REPLICA_URL` env var enables `ReadReplicaRouter`.
- **Axes**: Brute-force lockout after 5 attempts, 15min cooldown.

### Frontend

- **Path aliases**: `@/*` maps to `./src/*` (also `@/components/*`, `@/hooks/*`, `@/store/*`, `@/lib/*`, `@/types/*`).
- **State**: Zustand for cart + auth; TanStack Query for server state.
- **API client**: `src/lib/api.ts` — axios with auto-refresh on 401, request queuing during refresh.
- **ISR**: Product pages revalidate every 1h via `revalidate` export.
- **Service Worker**: `public/sw.js` — images cache-first, API/pages network-first.
- **PWA**: Manifest at `public/manifest.json`.

## Testing

### Backend (pytest)

- Config: `backend/pytest.ini`
- Settings: `DJANGO_SETTINGS_MODULE=hexashop.settings.development`
- Test files: `backend/tests/test_*.py`
- Markers: `@pytest.mark.django_db`
- Fixtures: Use `factory-boy` + `faker` for test data
- CI env vars needed: `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, `CLOUDINARY_*`

### Frontend (Vitest + Playwright)

- Vitest config: `frontend/vitest.config.ts` (jsdom, globals, setup file at `src/tests/setup.ts`)
- Playwright config: `frontend/playwright.config.ts` (test dir: `e2e/`, chromium + mobile chrome)
- E2E requires backend + db running (uses `docker compose up -d db redis backend`)
- Playwright baseURL: `PLAYWRIGHT_BASE_URL` env var or `http://localhost:3000`

## Environment Variables

Required (see `.env.example`):
- `DJANGO_SECRET_KEY` — Django secret key
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis for caching
- `CELERY_BROKER_URL` — Redis for Celery
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Media storage
- `NEXT_PUBLIC_API_URL` — Frontend → Backend API URL (e.g., `http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — Cloudinary for frontend image optimization

## Gotchas

- Backend uses `apps/<app_name>/` not `app/<app_name>/` — Django apps are nested under `backend/apps/`.
- `setup_local.sh` references `requirements.local.txt` which doesn't exist — use `requirements.txt` instead.
- JWT refresh interceptor in `src/lib/api.ts` explicitly skips `/auth/token/refresh` to prevent infinite loops.
- Cart uses optimistic UI updates — state changes before API confirmation.
- Product variants have `attributes` as JSON dict with `size` and `color` keys.
- Frontend `next.config.js` rewrites `/api/backend/*` to the actual API URL for proxying.
- Docker compose backend service runs migrations + collectstatic automatically on startup.
- E2E tests only run on `main` branch in CI, after backend + frontend tests pass.

## API Endpoints

All API routes are under `/api/v1/`:

| Path | App |
|------|-----|
| `/api/v1/auth/` | accounts (register, login, logout, token/refresh, me, addresses) |
| `/api/v1/products/` | products (CRUD, categories, search, recently-viewed, reviews) |
| `/api/v1/cart/` | cart |
| `/api/v1/wishlist/` | wishlist |
| `/api/v1/notifications/` | notifications (stock-alert, newsletter) |
| `/api/v1/settings/` | store_settings (site settings, hero slides) |
| `/api/v1/studio/` | store_settings (hero builder CRUD) |
| `/panel/` | admin_panel (server-rendered admin) |



# AI Agent Rules

## Primary Goal

You are a senior full-stack engineer responsible for delivering production-ready code.

Never consider a task complete until it has been verified.

---

## Workflow

For every task follow this order:

1. Understand the problem.
2. Create a short implementation plan.
3. Implement the solution.
4. Run linting.
5. Run relevant tests.
6. Fix all errors.
7. Verify the implementation.
8. Only then report completion.

---

## Backend Rules

After modifying Django code always:

- Run python manage.py check
- Run affected pytest tests
- Check for migration requirements
- Never create unnecessary migrations
- Ensure no traceback exists

---

## Frontend Rules

After modifying frontend code always:

- Run npm run type-check
- Run npm run lint
- Build if necessary
- Never leave Typescript errors

---

## UI Verification

When UI changes:

- Open the page in a browser.
- Verify visually.
- Use Playwright if available.
- Take screenshots before declaring success.

---

## API Verification

When API changes:

- Verify endpoint works.
- Check response format.
- Check authentication.
- Check validation.
- Check error handling.

---

## Code Quality

Always:

- Prefer existing project patterns.
- Avoid duplicate code.
- Keep functions small.
- Write readable code.
- Never leave TODOs.

---

## Git

Before finishing:

Review modified files.

Never modify unrelated files.

Never commit unless requested.

---

## Completion Criteria

Never say

"Done"

until:

✓ Tests pass

✓ No lint errors

✓ Build succeeds

✓ UI verified

✓ API verified

✓ No obvious console errors
