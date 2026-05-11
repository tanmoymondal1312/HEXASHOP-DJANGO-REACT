#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  HEXASHOP — LAN Dev Mode
#  Starts both Django (8000) and Next.js (3000) on all interfaces
#  so any device on your Wi-Fi can open the site.
#
#  Usage:  ./start-lan.sh
# ─────────────────────────────────────────────────────────────

set -e

# ── Detect LAN IP ────────────────────────────────────────────
LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}')
if [ -z "$LAN_IP" ]; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
if [ -z "$LAN_IP" ]; then
  echo "Could not detect LAN IP. Are you connected to Wi-Fi?"
  exit 1
fi

# ── Banner ───────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           HEXASHOP  —  LAN Dev Mode                 ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
printf  "║  Your LAN IP  :  %-35s║\n" "$LAN_IP"
echo "║                                                      ║"
printf  "║  Frontend     →  http://%-28s║\n" "$LAN_IP:3000"
printf  "║  Backend API  →  http://%-28s║\n" "$LAN_IP:8000/api/v1/"
printf  "║  Django Admin →  http://%-28s║\n" "$LAN_IP:8000/admin/"
printf  "║  Admin Panel  →  http://%-28s║\n" "$LAN_IP:8000/panel/"
echo "║                                                      ║"
echo "║  Open any of these on your mobile browser           ║"
echo "║  (must be on the same Wi-Fi network)                ║"
echo "║                                                      ║"
echo "║  Press Ctrl+C to stop both servers                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Start Django ─────────────────────────────────────────────
echo "► Starting Django on 0.0.0.0:8000 ..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Give Django a moment to boot
sleep 1

# ── Start Next.js ─────────────────────────────────────────────
echo "► Starting Next.js on 0.0.0.0:3000 ..."
cd "$SCRIPT_DIR/frontend"
NEXT_PUBLIC_API_URL="http://$LAN_IP:8000/api/v1" \
NEXT_PUBLIC_SITE_URL="http://$LAN_IP:3000" \
npm run dev -- -H 0.0.0.0 &
NEXTJS_PID=$!

echo ""
echo "Both servers are running. Waiting for Next.js to compile..."
echo ""

# ── Graceful shutdown on Ctrl+C ───────────────────────────────
cleanup() {
  echo ""
  echo "Stopping servers..."
  kill "$DJANGO_PID" "$NEXTJS_PID" 2>/dev/null || true
  wait "$DJANGO_PID" "$NEXTJS_PID" 2>/dev/null || true
  echo "Done."
  exit 0
}
trap cleanup INT TERM

wait
