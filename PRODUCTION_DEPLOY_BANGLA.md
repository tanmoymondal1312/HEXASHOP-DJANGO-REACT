# HEXASHOP — প্রোডাকশন ডিপ্লয় গাইড (বাংলায়)
### VPS (Ubuntu) + Vercel — সম্পূর্ণ ধাপে ধাপে

> **এই গাইডটি তাদের জন্য যারা DevOps সম্পর্কে কিছুই জানেন না।**
> প্রতিটি কমান্ড কেন দিচ্ছ সেটাও বলা আছে। শুধু কপি-পেস্ট করলেই হবে না — বুঝে করো।

---

## 🏗️ আর্কিটেকচার — কোন টুল কী করে?

```
                        ইন্টারনেট (ব্যবহারকারী)
                               │
                    ┌──────────▼──────────┐
                    │   Cloudflare DNS    │  ← ডোমেইন নাম → IP রূপান্তর
                    │  hexashop.com       │    DDoS সুরক্ষা, বিনামূল্যে CDN
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
   ┌──────────▼──────────┐           ┌─────────▼──────────┐
   │     Vercel CDN      │           │   VPS (Ubuntu 22)  │
   │  (Frontend - Free)  │           │   your-ip-address  │
   │                     │           │                    │
   │  Next.js 14         │           │  ┌──────────────┐  │
   │  - SSR পেজ          │           │  │    Nginx     │  │
   │  - Static ফাইল      │           │  │  Port 80/443 │  │
   │  - Edge Network     │           │  │  (Gatekeeper)│  │
   │  - Auto SSL         │           │  └──────┬───────┘  │
   └─────────────────────┘           │         │          │
              │                      │  ┌──────▼───────┐  │
              │ API call             │  │   Gunicorn   │  │
              │ (fetch/axios)        │  │  Port 8000   │  │
              └──────────────────────►  │  (Django     │  │
                                    │  │   Worker)    │  │
                                    │  └──────┬───────┘  │
                                    │         │          │
                                    │  ┌──────▼───────┐  │
                                    │  │    Django    │  │
                                    │  │  App Logic   │  │
                                    │  └──┬───────┬───┘  │
                                    │     │       │      │
                              ┌─────▼──┐ ┌▼─────┐ │      │
                              │Postgres│ │Redis │ │      │
                              │  DB    │ │Cache │ │      │
                              │(ডেটা) │ │(দ্রুত│ │      │
                              └────────┘ │ ক্যাশ│ │      │
                                         └──────┘ │      │
                                    │             │      │
                                    │  ┌──────────▼───┐  │
                                    │  │    Celery    │  │
                                    │  │   Worker     │  │
                                    │  │(Background   │  │
                                    │  │  কাজ)        │  │
                                    │  └──────────────┘  │
                                    └────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Cloudinary (ছবি CDN)                     │
│  পণ্যের ছবি → WebP রূপান্তর → গ্লোবাল CDN থেকে দ্রুত লোড  │
└─────────────────────────────────────────────────────────────┘
```

### প্রতিটি টুল কী কাজ করে?

| টুল | কাজ | কেন দরকার |
|-----|-----|-----------|
| **Nginx** | সার্ভারের দরজা — ট্রাফিক পরিচালনা | সরাসরি Django-তে ট্রাফিক দিলে ধীর ও অনিরাপদ |
| **Gunicorn** | Django চালানোর ইঞ্জিন | Django-র built-in সার্ভার প্রোডাকশনের জন্য নয় |
| **PostgreSQL** | মূল ডেটাবেজ | পণ্য, ইউজার, অর্ডার সব এখানে সংরক্ষিত |
| **Redis** | দ্রুত মেমোরি স্টোরেজ | ক্যাশ + গেস্ট কার্ট + Celery queue |
| **Celery** | ব্যাকগ্রাউন্ড কাজ | ইমেইল পাঠানো, ছবি প্রসেস — ইউজারকে অপেক্ষা করায় না |
| **Certbot** | SSL সার্টিফিকেট | HTTPS চালু করে — তালা আইকন দেখায় |
| **Vercel** | Frontend হোস্টিং | Next.js-এর জন্য বিনামূল্যে, দ্রুত, বিশ্বজুড়ে CDN |
| **Cloudinary** | ছবি স্টোরেজ | পণ্যের ছবি ক্লাউডে, WebP রূপান্তর, দ্রুত লোড |
| **Systemd** | সার্ভিস ম্যানেজার | VPS রিস্টার্ট হলে সব অটো চালু হয় |

---

## 📋 শুরু করার আগে যা যা দরকার

- [ ] একটা ডোমেইন নাম (যেমন: `hexashop.com`) — Namecheap/GoDaddy থেকে কিনো
- [ ] VPS: Ubuntu 22.04 LTS, কমপক্ষে **2GB RAM, 2 CPU, 40GB Storage**
- [ ] Vercel একাউন্ট: [vercel.com](https://vercel.com) — বিনামূল্যে
- [ ] Cloudinary একাউন্ট: [cloudinary.com](https://cloudinary.com) — বিনামূল্যে
- [ ] GitHub Repository: প্রজেক্ট কোড আপলোড করা থাকতে হবে

---

## 🖥️ পর্ব ১ — VPS-এ প্রাথমিক সেটআপ

### ধাপ ১.১ — VPS-এ ঢোকো (SSH)

তোমার কম্পিউটারের টার্মিনালে:

```bash
ssh root@তোমার_VPS_IP
```

**উদাহরণ:** `ssh root@139.59.1.234`

প্রথমবার একটা সতর্কবার্তা আসবে। `yes` টাইপ করো, তারপর পাসওয়ার্ড দাও।

> **কেন SSH?** — SSH (Secure Shell) হলো ইন্টারনেটের মাধ্যমে নিরাপদভাবে দূরের কম্পিউটার নিয়ন্ত্রণ করার পদ্ধতি। সব যোগাযোগ এনক্রিপ্টেড।

---

### ধাপ ১.২ — সিস্টেম আপডেট করো

```bash
apt update && apt upgrade -y
```

> **কেন?** — নতুন VPS-এ পুরনো সফটওয়্যার থাকতে পারে। আপডেট না করলে নিরাপত্তার ঝুঁকি।
> `apt` হলো Ubuntu-র প্যাকেজ ম্যানেজার — যেমন ফোনের Play Store।

---

### ধাপ ১.৩ — প্রয়োজনীয় টুলস ইনস্টল

```bash
apt install -y curl wget git vim ufw fail2ban unzip build-essential python3-pip python3-venv python3-dev libpq-dev
```

> **প্রতিটা কী করে:**
> - `curl/wget` — ইন্টারনেট থেকে ফাইল ডাউনলোড
> - `git` — কোড ডাউনলোড করতে
> - `ufw` — ফায়ারওয়াল (অননুমোদিত প্রবেশ বন্ধ)
> - `fail2ban` — বারবার ভুল পাসওয়ার্ড দিলে IP ব্লক
> - `libpq-dev` — PostgreSQL-এর সাথে Python কথা বলার জন্য

---

### ধাপ ১.৪ — নিরাপত্তার জন্য আলাদা ইউজার তৈরি

```bash
adduser hexashop
```

নাম, পাসওয়ার্ড চাইবে — দিয়ে দাও। বাকিগুলো খালি রেখে Enter চাপো।

```bash
usermod -aG sudo hexashop
```

```bash
su - hexashop
```

> **কেন root ব্যবহার করব না?**
> root ইউজার সার্ভারের সর্বময় কর্তা। ভুলে একটা কমান্ড দিলে পুরো সার্ভার নষ্ট হতে পারে।
> `hexashop` ইউজার সীমিত ক্ষমতা রাখে, কিন্তু `sudo` দিয়ে দরকার হলে root-এর কাজ করতে পারে।

---

### ধাপ ১.৫ — ফায়ারওয়াল চালু করো

```bash
sudo ufw allow 22      # SSH — নিজে ঢোকার দরজা খোলা রাখো
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable        # ফায়ারওয়াল চালু
sudo ufw status        # চেক করো
```

> **কেন ফায়ারওয়াল?**
> ইন্টারনেট থেকে যেকোনো পোর্টে আক্রমণ হতে পারে। UFW (Uncomplicated Firewall) বলে দেয় কোন পোর্ট খোলা থাকবে। আমরা শুধু ২২ (SSH), ৮০ (HTTP), ৪৪৩ (HTTPS) খুলেছি।

---

## 🗃️ পর্ব ২ — PostgreSQL ডেটাবেজ সেটআপ

### ধাপ ২.১ — PostgreSQL ইনস্টল

```bash
sudo apt install -y postgresql postgresql-contrib
```

> **PostgreSQL কী?** — একটি শক্তিশালী ওপেন-সোর্স ডেটাবেজ সিস্টেম। পণ্য, ইউজার, কার্ট — সব তথ্য এখানে সংরক্ষিত থাকে। MySQL-এর মতো কিন্তু আরও শক্তিশালী।

### ধাপ ২.২ — PostgreSQL চালু হয়েছে কিনা চেক করো

```bash
sudo systemctl status postgresql
```

`active (running)` দেখালে ভালো। না হলে:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

> **systemctl কী?** — Ubuntu-র সার্ভিস ম্যানেজার। `enable` মানে VPS রিস্টার্ট হলেও অটো চালু হবে।

### ধাপ ২.৩ — ডেটাবেজ ও ইউজার তৈরি

```bash
sudo -u postgres psql
```

এখন `postgres=#` প্রম্পট আসবে। এখানে টাইপ করো:

```sql
CREATE DATABASE hexashop_db;
```
```sql
CREATE USER hexashop_user WITH PASSWORD 'এখানে_একটা_শক্ত_পাসওয়ার্ড_দাও';
```
```sql
GRANT ALL PRIVILEGES ON DATABASE hexashop_db TO hexashop_user;
```
```sql
ALTER DATABASE hexashop_db OWNER TO hexashop_user;
```
```sql
\q
```

> ⚠️ **গুরুত্বপূর্ণ:** পাসওয়ার্ড নিরাপদ জায়গায় লিখে রাখো! যেমন: `Hx@2024$Secure#99`
> ছোট হাতের + বড় হাতের + সংখ্যা + বিশেষ চিহ্ন = শক্ত পাসওয়ার্ড।

### ধাপ ২.৪ — PostgreSQL কানেকশন টেস্ট

```bash
psql -U hexashop_user -d hexashop_db -h localhost
```

পাসওয়ার্ড দিলে `hexashop_db=>` দেখাবে — সফল। বের হতে `\q`।

---

## ⚡ পর্ব ৩ — Redis সেটআপ

### ধাপ ৩.১ — Redis ইনস্টল

```bash
sudo apt install -y redis-server
```

> **Redis কী?** — RAM-এ ডেটা রাখে, তাই অনেক দ্রুত। আমরা তিনটা কাজে ব্যবহার করি:
> ১. পণ্যের তথ্য ক্যাশ (ডেটাবেজ কম চাপ পড়ে)
> ২. গেস্ট শপিং কার্ট সংরক্ষণ
> ৩. Celery-র task queue (কোন কাজ কখন করতে হবে)

### ধাপ ৩.২ — Redis কনফিগার করো

```bash
sudo vim /etc/redis/redis.conf
```

vim খুললে `i` চাপো (insert mode), তারপর খুঁজে পাল্টাও:

```
# এই লাইন খুঁজো:
supervised no

# পাল্টে করো:
supervised systemd
```

```
# এই লাইন খুঁজো:
# maxmemory <bytes>

# পাল্টে করো (512MB সীমা):
maxmemory 512mb
maxmemory-policy allkeys-lru
```

পরিবর্তন সংরক্ষণ: `Esc` চাপো, তারপর `:wq` টাইপ করে Enter।

> **maxmemory-policy allkeys-lru কী?** — Redis ভরে গেলে সবচেয়ে কম ব্যবহৃত পুরনো ডেটা মুছে দেবে।
> LRU = Least Recently Used।

### ধাপ ৩.৩ — Redis চালু করো

```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
sudo systemctl status redis-server
```

### ধাপ ৩.৪ — Redis কাজ করছে কিনা টেস্ট

```bash
redis-cli ping
```

`PONG` দেখালে সফল।

---

## 🐍 পর্ব ৪ — Django Backend সেটআপ

### ধাপ ৪.১ — প্রজেক্ট ফোল্ডার তৈরি ও কোড নামাও

```bash
sudo mkdir -p /var/www/hexashop
sudo chown hexashop:hexashop /var/www/hexashop
cd /var/www/hexashop
```

```bash
git clone https://github.com/তোমার_username/hexashop.git .
```

> **কেন `/var/www/`?** — Linux-এ ওয়েব সার্ভারের ফাইল এই ফোল্ডারে রাখার প্রচলন।
> ভালো অভ্যাস মেনে চলা মানে পরে রক্ষণাবেক্ষণ সহজ হয়।

### ধাপ ৪.২ — Python ভার্চুয়াল এনভায়রনমেন্ট

```bash
cd /var/www/hexashop/backend
python3 -m venv venv
source venv/bin/activate
```

> **venv কী?** — একটা বিচ্ছিন্ন Python পরিবেশ। এক প্রজেক্টের লাইব্রেরি আরেক প্রজেক্টকে প্রভাবিত করে না।
> ধরো দুটো রান্নাঘর — একটায় বাংলা রান্না, একটায় চাইনিজ। সব মশলা আলাদা, মেশানো নেই।

### ধাপ ৪.৩ — Python প্যাকেজ ইনস্টল

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

> **Gunicorn কী?** — WSGI server। Django-কে বলো "এই রিকোয়েস্ট আসলে তুমি প্রসেস করো"।
> Django-র built-in সার্ভার (`runserver`) শুধু development-এর জন্য — একটাই request একসাথে সামলাতে পারে।
> Gunicorn ৪টা worker চালায় — ৪টা request একসাথে!

### ধাপ ৪.৪ — প্রোডাকশন .env ফাইল তৈরি

```bash
vim /var/www/hexashop/backend/.env
```

`i` চাপো তারপর এটা লেখো (তোমার মান দিয়ে পাল্টাও):

```bash
# Django
DJANGO_SECRET_KEY=এখানে_৫০_অক্ষরের_এলোমেলো_স্ট্রিং_দাও
DJANGO_SETTINGS_MODULE=hexashop.settings.production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=hexashop.com,www.hexashop.com,তোমার_VPS_IP

# Database
DATABASE_URL=postgresql://hexashop_user:তোমার_DB_পাসওয়ার্ড@localhost:5432/hexashop_db

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Cloudinary (cloudinary.com থেকে নাও)
CLOUDINARY_CLOUD_NAME=তোমার_cloud_name
CLOUDINARY_API_KEY=তোমার_api_key
CLOUDINARY_API_SECRET=তোমার_api_secret

# Email (SendGrid/Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=তোমার_sendgrid_api_key
DEFAULT_FROM_EMAIL=noreply@hexashop.com

# CORS
CORS_ALLOWED_ORIGINS=https://hexashop.com,https://www.hexashop.com
FRONTEND_URL=https://hexashop.com
```

`Esc` → `:wq` → Enter

> **Secret Key কীভাবে বানাবে?** একটা নতুন terminal-এ:
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```
> যা আসবে সেটাই DJANGO_SECRET_KEY-তে দাও।

### ধাপ ৪.৫ — ডেটাবেজ মাইগ্রেশন

```bash
cd /var/www/hexashop/backend
source venv/bin/activate

python manage.py makemigrations accounts
python manage.py makemigrations products
python manage.py makemigrations cart
python manage.py makemigrations wishlist
python manage.py makemigrations notifications
python manage.py migrate
```

### ধাপ ৪.৬ — Static ফাইল ও Admin ইউজার

```bash
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

নাম, ইমেইল, পাসওয়ার্ড দাও — এটাই Admin Panel-এর লগইন।

### ধাপ ৪.৭ — Gunicorn টেস্ট করো

```bash
gunicorn hexashop.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

এরর না দেখালে সফল। `Ctrl+C` দিয়ে বন্ধ করো — এটা শুধু টেস্ট ছিল।

---

## 🔄 পর্ব ৫ — Systemd সার্ভিস (অটো চালু)

Systemd হলো VPS-এর সার্ভিস ম্যানেজার। VPS রিস্টার্ট হলে এটা নিজে নিজে সব চালু করে।

### ধাপ ৫.১ — Gunicorn সার্ভিস ফাইল

```bash
sudo vim /etc/systemd/system/hexashop-gunicorn.service
```

`i` চাপো, এটা লেখো:

```ini
[Unit]
Description=HEXASHOP Django (Gunicorn)
After=network.target postgresql.service redis.service

[Service]
User=hexashop
Group=www-data
WorkingDirectory=/var/www/hexashop/backend
EnvironmentFile=/var/www/hexashop/backend/.env
ExecStart=/var/www/hexashop/backend/venv/bin/gunicorn \
    hexashop.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile /var/log/hexashop/gunicorn-access.log \
    --error-logfile /var/log/hexashop/gunicorn-error.log
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

`Esc` → `:wq` → Enter

> **`--workers 4` কেন?** — ৪টা আলাদা প্রসেস একসাথে ৪টা রিকোয়েস্ট সামলাতে পারে।
> নিয়ম: `(CPU কোর × 2) + 1` — 2 core VPS-এ = 5 workers।

### ধাপ ৫.২ — Celery Worker সার্ভিস

```bash
sudo vim /etc/systemd/system/hexashop-celery.service
```

```ini
[Unit]
Description=HEXASHOP Celery Worker
After=network.target redis.service

[Service]
User=hexashop
Group=www-data
WorkingDirectory=/var/www/hexashop/backend
EnvironmentFile=/var/www/hexashop/backend/.env
ExecStart=/var/www/hexashop/backend/venv/bin/celery \
    -A celery_app worker \
    -l info \
    -Q default,emails,inventory,reporting \
    -c 4 \
    --logfile=/var/log/hexashop/celery.log
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

### ধাপ ৫.৩ — Celery Beat সার্ভিস (নির্ধারিত সময়ের কাজ)

```bash
sudo vim /etc/systemd/system/hexashop-celerybeat.service
```

```ini
[Unit]
Description=HEXASHOP Celery Beat Scheduler
After=network.target redis.service

[Service]
User=hexashop
Group=www-data
WorkingDirectory=/var/www/hexashop/backend
EnvironmentFile=/var/www/hexashop/backend/.env
ExecStart=/var/www/hexashop/backend/venv/bin/celery \
    -A celery_app beat \
    -l info \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler \
    --logfile=/var/log/hexashop/celerybeat.log
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

> **Celery Beat কী?** — একটা ডিজিটাল ঘড়ি। বলে দাও "প্রতি রাত ১২টায় লো-স্টক চেক করো" — সে নিজেই করবে।

### ধাপ ৫.৪ — Log ফোল্ডার তৈরি ও সার্ভিস চালু

```bash
sudo mkdir -p /var/log/hexashop
sudo chown hexashop:hexashop /var/log/hexashop

sudo systemctl daemon-reload

sudo systemctl enable hexashop-gunicorn
sudo systemctl enable hexashop-celery
sudo systemctl enable hexashop-celerybeat

sudo systemctl start hexashop-gunicorn
sudo systemctl start hexashop-celery
sudo systemctl start hexashop-celerybeat
```

### ধাপ ৫.৫ — সার্ভিস চলছে কিনা চেক করো

```bash
sudo systemctl status hexashop-gunicorn
sudo systemctl status hexashop-celery
```

`active (running)` দেখলে সফল। ✅

---

## 🌐 পর্ব ৬ — Nginx সেটআপ (ওয়েবসার্ভার)

### ধাপ ৬.১ — Nginx ইনস্টল

```bash
sudo apt install -y nginx
```

> **Nginx কী করে?**
> ধরো একটা বড় হোটেলের রিসেপশনিস্ট:
> - `/api/` গেলে → Django-তে পাঠায়
> - `/static/` গেলে → সরাসরি ফাইল দেয় (দ্রুত!)
> - বাকি সব → (ঐচ্ছিক) Next.js-এ পাঠায়
> - ১০০০ মানুষ একসাথে এলেও সামলাতে পারে

### ধাপ ৬.২ — HEXASHOP-এর Nginx কনফিগ

```bash
sudo vim /etc/nginx/sites-available/hexashop
```

`i` চাপো, এটা লেখো **(তোমার ডোমেইন দিয়ে পাল্টাও)**:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name hexashop.com www.hexashop.com;
    return 301 https://$host$request_uri;
}

# মূল HTTPS সার্ভার
server {
    listen 443 ssl http2;
    server_name hexashop.com www.hexashop.com;

    # SSL সার্টিফিকেট (Certbot পরে বানাবে)
    ssl_certificate /etc/letsencrypt/live/hexashop.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hexashop.com/privkey.pem;

    # SSL নিরাপত্তা
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # নিরাপত্তার হেডার
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # ফাইল আপলোডের সীমা
    client_max_body_size 20M;

    # Gzip চালু (ফাইল ছোট করে পাঠায়, দ্রুত লোড)
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Static ফাইল (CSS, JS, Admin) — Nginx সরাসরি দেয়, Django-তে যায় না
    location /static/ {
        alias /var/www/hexashop/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media ফাইল (আপলোড করা ছবি)
    location /media/ {
        alias /var/www/hexashop/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Django API — Gunicorn-এ পাঠাও
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Health check, Sitemap, Robots
    location ~ ^/(health|sitemap.xml|robots.txt|metrics) {
        proxy_pass http://127.0.0.1:8000;
    }

    # Frontend — Vercel-এ হোস্ট করলে এই block লাগবে না
    # VPS-এ Next.js চালালে এটা চালু রাখো
    # location / {
    #     proxy_pass http://127.0.0.1:3000;
    # }
}
```

`Esc` → `:wq` → Enter

### ধাপ ৬.৩ — Nginx কনফিগ সক্রিয় করো

```bash
# symlink তৈরি করো (সক্রিয় করার উপায়)
sudo ln -s /etc/nginx/sites-available/hexashop /etc/nginx/sites-enabled/

# default সাইট বন্ধ করো
sudo rm -f /etc/nginx/sites-enabled/default

# কনফিগ সঠিক আছে কিনা পরীক্ষা করো
sudo nginx -t
```

`syntax is ok` এবং `test is successful` দেখালে:

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 পর্ব ৭ — SSL সার্টিফিকেট (HTTPS চালু)

### ধাপ ৭.১ — Certbot ইনস্টল

```bash
sudo apt install -y certbot python3-certbot-nginx
```

> **SSL কী?** — HTTPS-এর তালা আইকন। ব্রাউজার থেকে সার্ভার পর্যন্ত সব তথ্য এনক্রিপ্টেড।
> Certbot বিনামূল্যে SSL সার্টিফিকেট দেয় (Let's Encrypt)।

### ধাপ ৭.২ — সার্টিফিকেট নাও

```bash
sudo certbot --nginx -d hexashop.com -d www.hexashop.com
```

ইমেইল চাইবে → দাও
Terms of Service → `Y`
Newsletter → `N` (ঐচ্ছিক)

> ⚠️ **এর আগে ডোমেইন DNS সেটআপ করতে হবে!**
> ডোমেইন রেজিস্ট্রারে গিয়ে A record:
> `hexashop.com` → তোমার VPS IP
> `www.hexashop.com` → তোমার VPS IP

### ধাপ ৭.৩ — অটো-নবায়ন চালু

```bash
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

> SSL সার্টিফিকেট ৯০ দিনে মেয়াদ শেষ হয়। `certbot.timer` নিজেই নবায়ন করে — তুমি কিছু করতে হবে না।

---

## 🌍 পর্ব ৮ — Vercel-এ Frontend ডিপ্লয়

### ধাপ ৮.১ — GitHub-এ কোড আপলোড করো

তোমার **লোকাল কম্পিউটারে** (VPS-এ নয়):

```bash
cd "/home/tanmoy/Projects/Django Projects/HEXASHOP"
git init
git add .
git commit -m "Initial commit: HEXASHOP production ready"
git branch -M main
git remote add origin https://github.com/তোমার_username/hexashop.git
git push -u origin main
```

### ধাপ ৮.২ — Vercel-এ সাইন ইন

1. [vercel.com](https://vercel.com) → **Sign Up** → GitHub দিয়ে লগইন
2. **Add New Project** ক্লিক করো
3. GitHub Repository-তে `hexashop` খুঁজো → **Import**

### ধাপ ৮.৩ — Vercel প্রজেক্ট কনফিগার করো

**Framework Preset:** `Next.js` (অটো ধরবে)

**Root Directory:** `frontend` ক্লিক করো → `frontend` সিলেক্ট করো

**Environment Variables** সেকশনে এগুলো যোগ করো:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://hexashop.com/api/v1` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | তোমার Cloudinary cloud name |
| `NEXT_PUBLIC_SITE_URL` | `https://hexashop.com` |

**Deploy** ক্লিক করো।

⏳ ২-৩ মিনিট অপেক্ষা করো। সবুজ টিক দেখালে সফল!

### ধাপ ৮.৪ — কাস্টম ডোমেইন যোগ করো (Vercel)

Vercel Dashboard → তোমার প্রজেক্ট → **Settings** → **Domains**:

```
hexashop.com
www.hexashop.com
```

Vercel DNS রেকর্ড দেখাবে — সেগুলো তোমার ডোমেইন রেজিস্ট্রারে যোগ করো।

---

## 🧪 পর্ব ৯ — সব কিছু কাজ করছে কিনা পরীক্ষা

### ব্রাউজারে এগুলো চেক করো:

```
✅ https://hexashop.com                    → Frontend (Vercel)
✅ https://hexashop.com/api/v1/products/   → Products API
✅ https://hexashop.com/admin/             → Django Admin
✅ https://hexashop.com/health/            → Health Check
✅ https://hexashop.com/sitemap.xml        → Sitemap
```

### VPS-এ লগ চেক করো:

```bash
# Gunicorn লগ (Django এরর)
sudo tail -f /var/log/hexashop/gunicorn-error.log

# Nginx লগ (রিকোয়েস্ট লগ)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Celery লগ (ব্যাকগ্রাউন্ড কাজ)
sudo tail -f /var/log/hexashop/celery.log
```

> **`tail -f` কী?** — লগ ফাইলের শেষ অংশ দেখায় এবং নতুন লাইন আসলে সঙ্গে সঙ্গে দেখায়। `Ctrl+C` দিয়ে বন্ধ করো।

---

## 🔄 পর্ব ১০ — আপডেট ডিপ্লয় করার পদ্ধতি

নতুন কোড পরিবর্তন করলে কীভাবে সার্ভারে আপলোড করবে:

### Backend আপডেট (VPS-এ):

```bash
cd /var/www/hexashop
git pull origin main

cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

sudo systemctl restart hexashop-gunicorn
sudo systemctl restart hexashop-celery
sudo systemctl restart hexashop-celerybeat
```

### Frontend আপডেট (Vercel):

```bash
# লোকাল কম্পিউটারে
git add .
git commit -m "Update: নতুন ফিচার"
git push origin main
```

Vercel `main` branch-এ push দেখলে **অটোমেটিক** নতুন ভার্সন ডিপ্লয় করে! 🎉

---

## 🛡️ পর্ব ১১ — নিরাপত্তা ও পর্যবেক্ষণ

### Fail2ban — SSH আক্রমণ ঠেকানো

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status sshd
```

> **Fail2ban কী?** — কেউ বারবার ভুল পাসওয়ার্ড দিলে তার IP ১৫ মিনিটের জন্য ব্লক করে।
> হ্যাকাররা বট দিয়ে হাজার হাজার পাসওয়ার্ড চেষ্টা করে — Fail2ban এটা ঠেকায়।

### ডেটাবেজ ব্যাকআপ (প্রতিদিন)

```bash
sudo vim /etc/cron.d/hexashop-backup
```

```bash
# প্রতিদিন রাত ২টায় ব্যাকআপ
0 2 * * * hexashop pg_dump hexashop_db > /var/backups/hexashop_$(date +\%Y\%m\%d).sql
# ৩০ দিনের বেশি পুরনো ব্যাকআপ মুছে দাও
0 3 * * * find /var/backups/ -name "hexashop_*.sql" -mtime +30 -delete
```

```bash
sudo mkdir -p /var/backups
sudo chown hexashop:hexashop /var/backups
```

> **cron কী?** — নির্ধারিত সময়ে অটোমেটিক কমান্ড চালায়।
> `0 2 * * *` = প্রতিদিন রাত ২:০০ তে।

### সার্ভিস স্ট্যাটাস একনজরে দেখো

```bash
# সব সার্ভিস একসাথে চেক
sudo systemctl status hexashop-gunicorn hexashop-celery hexashop-celerybeat nginx redis postgresql
```

---

## 🚨 সমস্যা হলে কী করবে

### সমস্যা ১: সাইট খুলছে না (502 Bad Gateway)
```bash
sudo systemctl status hexashop-gunicorn
sudo tail -20 /var/log/hexashop/gunicorn-error.log
```
সম্ভাব্য কারণ: `.env` ফাইলে ভুল, অথবা Django-তে এরর।

### সমস্যা ২: Static ফাইল নেই (CSS কাজ করছে না)
```bash
cd /var/www/hexashop/backend
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl reload nginx
```

### সমস্যা ৩: ডেটাবেজ কানেক্ট হচ্ছে না
```bash
sudo systemctl status postgresql
# .env-এ DATABASE_URL ঠিক আছে কিনা চেক করো
```

### সমস্যা ৪: Celery কাজ করছে না
```bash
sudo systemctl restart hexashop-celery
sudo tail -20 /var/log/hexashop/celery.log
```

---

## 📊 পর্ব ১২ — পারফরম্যান্স মনিটরিং

### সার্ভার রিসোর্স দেখো

```bash
# CPU ও RAM ব্যবহার (লাইভ)
htop

# ডিস্ক ব্যবহার
df -h

# কোন প্রসেস বেশি RAM খাচ্ছে
ps aux --sort=-%mem | head -10
```

### Redis ক্যাশ হিট রেট দেখো

```bash
redis-cli info stats | grep hit
```

`keyspace_hits` বেশি হলে ক্যাশ ভালো কাজ করছে।

---

## ✅ ডিপ্লয় চেকলিস্ট

প্রোডাকশনে যাওয়ার আগে এগুলো নিশ্চিত করো:

- [ ] `.env`-এ `DJANGO_DEBUG=False`
- [ ] শক্তিশালী `DJANGO_SECRET_KEY` দেওয়া হয়েছে
- [ ] PostgreSQL পাসওয়ার্ড শক্ত
- [ ] `ALLOWED_HOSTS`-এ শুধু তোমার ডোমেইন
- [ ] SSL সার্টিফিকেট কাজ করছে (https://)
- [ ] Admin Panel কাজ করছে
- [ ] একটা পণ্য তৈরি করে দেখো
- [ ] কার্টে পণ্য যোগ করো
- [ ] ডেটাবেজ ব্যাকআপ চালু হয়েছে
- [ ] Fail2ban চালু আছে
- [ ] সব systemd সার্ভিস `enabled` আছে

---

## 🎯 সংক্ষিপ্ত সারাংশ

```
লোকাল কোড পরিবর্তন
        ↓
git push origin main
        ↓
┌───────────────────────────────────┐
│  Vercel (Frontend)                │
│  GitHub push → Auto Deploy        │
│  Next.js build → CDN-এ ছড়িয়ে দাও │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│  VPS (Backend)                    │
│  git pull → pip install           │
│  migrate → collectstatic          │
│  systemctl restart gunicorn       │
└───────────────────────────────────┘
        ↓
সাইট আপডেট! 🚀
```

---

*এই গাইড অনুসরণ করলে তুমি একটা প্রোডাকশন-গ্রেড ই-কমার্স সাইট সফলভাবে ডিপ্লয় করতে পারবে।*
*যেকোনো সমস্যায় এরর মেসেজটা দেখো — সাধারণত সমাধান সেখানেই লেখা থাকে।*

**শুভকামনা! 🎉**
