#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  HEXASHOP — LAN Dev Mode  (mDNS hostname edition)
#  Starts Django (8000) + Next.js (3000) on all interfaces.
#
#  Usage:  ./start-lan.sh
# ─────────────────────────────────────────────────────────────

set -e

LAN_HOST="tanmoy-ubuntu-computer.local"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           HEXASHOP  —  LAN Dev Mode                 ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
printf  "║  Hostname     :  %-35s║\n" "$LAN_HOST"
echo "║                                                      ║"
printf  "║  Frontend     →  http://%-28s║\n" "$LAN_HOST:3000"
printf  "║  Backend API  →  http://%-28s║\n" "$LAN_HOST:8000/api/v1/"
printf  "║  Django Admin →  http://%-28s║\n" "$LAN_HOST:8000/admin/"
printf  "║  Admin Panel  →  http://%-28s║\n" "$LAN_HOST:8000/panel/"
echo "║                                                      ║"
echo "║  Open the Frontend URL on any device on Wi-Fi       ║"
echo "║  Press Ctrl+C to stop both servers                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Start Django ─────────────────────────────────────────────
echo "► Starting Django on 0.0.0.0:8000 ..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# ── Start Celery worker (background jobs: image compression, emails…) ──
echo "► Starting Celery worker ..."
python -m celery -A celery_app worker \
  -Q default,emails,inventory,reporting \
  --concurrency=2 -l warning &
CELERY_PID=$!

sleep 1

# ── Start Next.js ─────────────────────────────────────────────
echo "► Starting Next.js on 0.0.0.0:3000 ..."
cd "$SCRIPT_DIR/frontend"
NEXT_PUBLIC_API_URL="http://$LAN_HOST:8000/api/v1" \
NEXT_PUBLIC_SITE_URL="http://$LAN_HOST:3000" \
npm run dev -- -H 0.0.0.0 &
NEXTJS_PID=$!

echo ""
echo "Both servers running. Waiting for Next.js to compile..."
echo ""

# ── Graceful shutdown ─────────────────────────────────────────
cleanup() {
  echo ""
  echo "Stopping servers..."
  kill "$DJANGO_PID" "$NEXTJS_PID" "$CELERY_PID" 2>/dev/null || true
  wait "$DJANGO_PID" "$NEXTJS_PID" "$CELERY_PID" 2>/dev/null || true
  echo "Done."
  exit 0
}
trap cleanup INT TERM

wait
