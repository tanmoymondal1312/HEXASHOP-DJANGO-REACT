#!/bin/bash
# HEXASHOP লোকাল সেটআপ স্ক্রিপ্ট
# চালাও: bash setup_local.sh

set -e  # কোনো এরর হলে থামো

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   HEXASHOP লোকাল সেটআপ শুরু হচ্ছে   ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── ধাপ ১: Python ভার্চুয়াল এনভায়রনমেন্ট ─────────────────────────────────
echo "▶ ধাপ ১/৫: Python ভার্চুয়াল এনভায়রনমেন্ট তৈরি করছি..."
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  ✅ venv তৈরি হয়েছে"
else
    echo "  ✅ venv আগে থেকেই আছে"
fi

source venv/bin/activate

# ── ধাপ ২: Python প্যাকেজ ইনস্টল ──────────────────────────────────────────
echo ""
echo "▶ ধাপ ২/৫: Python প্যাকেজ ইনস্টল করছি (একটু সময় লাগবে)..."
pip install --upgrade pip -q
pip install -r requirements.local.txt -q
echo "  ✅ সব Python প্যাকেজ ইনস্টল হয়েছে"

# ── ধাপ ৩: Django মাইগ্রেশন ────────────────────────────────────────────────
echo ""
echo "▶ ধাপ ৩/৫: ডেটাবেজ তৈরি করছি..."
python manage.py migrate --run-syncdb 2>/dev/null || python manage.py migrate
echo "  ✅ ডেটাবেজ রেডি"

# ── ধাপ ৪: Static ফাইল ─────────────────────────────────────────────────────
echo ""
echo "▶ ধাপ ৪/৫: Static ফাইল কপি করছি..."
python manage.py collectstatic --noinput -v 0
echo "  ✅ Static ফাইল রেডি"

# ── ধাপ ৫: Frontend প্যাকেজ ────────────────────────────────────────────────
echo ""
echo "▶ ধাপ ৫/৫: Frontend প্যাকেজ ইনস্টল করছি (একটু বেশি সময় লাগবে)..."
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps 2>/dev/null || npm install
echo "  ✅ Frontend প্যাকেজ ইনস্টল হয়েছে"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🎉 সেটআপ সম্পন্ন! এখন দুটো টার্মিনাল খোলো:          ║"
echo "║                                                          ║"
echo "║   টার্মিনাল ১ (Backend):                                 ║"
echo "║   cd backend && source venv/bin/activate                 ║"
echo "║   python manage.py runserver                             ║"
echo "║                                                          ║"
echo "║   টার্মিনাল ২ (Frontend):                                ║"
echo "║   cd frontend && npm run dev                             ║"
echo "║                                                          ║"
echo "║   তারপর ব্রাউজারে: http://localhost:3000                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
