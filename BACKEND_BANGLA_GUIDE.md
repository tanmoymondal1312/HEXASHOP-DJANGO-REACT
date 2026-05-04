# HEXASHOP ব্যাকএন্ড — সম্পূর্ণ গাইড (বাংলায়)

> **লেখকের কথা:** এই আর্টিকেলটি একদম নতুনদের জন্যও বোঝার মতো করে লেখা হয়েছে। Django দিয়ে একটা বড় ই-কমার্স সাইটের ব্যাকএন্ড কীভাবে সাজানো হয়, তার প্রতিটি ফোল্ডার ও ফাইল কী কাজ করে — সব কিছু বন্ধুর মতো করে বলা হয়েছে এখানে।

---

## 📦 প্রথমে বুঝি — ব্যাকএন্ড মানে কী?

তুমি যখন HEXASHOP-এ একটা হুডি দেখছ, সেটার দাম দেখছ, কার্টে যোগ করছ — এই সব কিছু সম্ভব হচ্ছে ব্যাকএন্ডের কারণে। ব্যাকএন্ড হলো রেস্তোরাঁর রান্নাঘরের মতো — তুমি শুধু সামনের টেবিলে বসে খাবার পাচ্ছ, কিন্তু পেছনে রান্না হচ্ছে, অর্ডার ম্যানেজ হচ্ছে।

আমাদের HEXASHOP-এর ব্যাকএন্ড তৈরি হয়েছে **Django** দিয়ে — Python-এর সবচেয়ে জনপ্রিয় ওয়েব ফ্রেমওয়ার্ক।

---

## 🗂️ ব্যাকএন্ড ফোল্ডার স্ট্রাকচার — একনজরে

```
backend/
│
├── 📁 hexashop/          ← প্রজেক্টের মূল সেটিং
│   └── 📁 settings/      ← ডেভ / প্রোডাকশন আলাদা কনফিগ
│
├── 📁 apps/              ← সব ফিচার এখানে বাস করে
│   ├── 📁 accounts/      ← ব্যবহারকারী ও লগইন সিস্টেম
│   ├── 📁 products/      ← পণ্য, ক্যাটাগরি, রিভিউ
│   ├── 📁 cart/          ← শপিং কার্ট
│   ├── 📁 wishlist/      ← পছন্দের লিস্ট
│   └── 📁 notifications/ ← নোটিফিকেশন ও ইমেইল
│
├── 📁 core/              ← সবাই মিলে ব্যবহার করে এমন টুলস
├── 📁 tests/             ← টেস্ট কোড
├── 📁 templates/         ← HTML টেমপ্লেট (robots.txt)
│
├── 📄 manage.py          ← Django-র রিমোট কন্ট্রোল
├── 📄 celery_app.py      ← ব্যাকগ্রাউন্ড কাজের ম্যানেজার
└── 📄 requirements.txt   ← সব লাইব্রেরির তালিকা
```

চলো এখন এক এক করে প্রতিটা ফোল্ডার ও ফাইলের ভেতরে ঢুকি! 🚀

---

## 🔧 `manage.py` — Django-র জাদুর কাঠি

```python
# manage.py
def main():
    os.setdefault("DJANGO_SETTINGS_MODULE", "hexashop.settings.development")
    execute_from_command_line(sys.argv)
```

**এটা কী করে?**

ধরো তুমি একটা অ্যাপার্টমেন্ট বিল্ডিং-এর ম্যানেজার। `manage.py` হলো তোমার মাস্টার চাবি। এই ফাইলটা দিয়ে তুমি:

- 🏗️ ডেটাবেজ তৈরি করতে পারো (`python manage.py migrate`)
- 👤 অ্যাডমিন একাউন্ট বানাতে পারো (`python manage.py createsuperuser`)
- 🚀 সার্ভার চালু করতে পারো (`python manage.py runserver`)
- 📦 নতুন ফিচারের জন্য ডেটাবেজ পরিবর্তন করতে পারো (`python manage.py makemigrations`)

**সহজ কথায়:** এটা ছাড়া Django প্রজেক্ট চালানোই যায় না।

---

## ⚡ `celery_app.py` — ব্যাকগ্রাউন্ড কাজের কারখানা

```python
app = Celery("hexashop")
app.conf.task_queues = {
    "default": ...,
    "emails": ...,      # ইমেইল পাঠানো
    "inventory": ...,   # স্টক আপডেট
    "reporting": ...,   # রিপোর্ট তৈরি
}
```

**এটা কী করে?**

কল্পনা করো তুমি একটা বড় রেস্তোরাঁয় গেলে। তুমি অর্ডার দিলে, ওয়েটার সঙ্গে সঙ্গে বলল "ঠিক আছে!" — কিন্তু রান্নাটা হবে পেছনে, ধীরে ধীরে। ঠিক এভাবেই Celery কাজ করে।

যেমন ধরো:
- কেউ কোনো পণ্য আউট অফ স্টক হলে নোটিফিকেশনের জন্য সাবস্ক্রাইব করল → Celery ব্যাকগ্রাউন্ডে ইমেইল পাঠাবে
- ১০০০টা পণ্যের ছবি প্রসেস করতে হবে → Celery করে দেবে, ইউজারকে অপেক্ষা করাবে না
- প্রতিদিন রাত ১২টায় রিপোর্ট তৈরি করতে হবে → Celery Beat এটা করবে

**৪টা আলাদা লেন (Queue) কেন?**

ধরো একটা লেনে শুধু ইমেইল যায়, আরেকটায় স্টক আপডেট। যদি কোনো কারণে ইমেইল সিস্টেম ধীর হয়ে যায়, তবুও স্টক আপডেট ঠিকঠাক চলবে — আলাদা লেনে!

---

## 📄 `requirements.txt` — উপকরণের তালিকা

```
Django==4.2.11
djangorestframework==3.15.1
redis==5.0.3
celery==5.3.6
cloudinary==1.38.0
...
```

**এটা কী করে?**

রান্নার রেসিপিতে যেমন উপকরণের তালিকা থাকে, এটা হলো তাই। এই ফাইলে লেখা আছে কোন কোন Python লাইব্রেরি ইনস্টল করতে হবে এবং কোন ভার্সনে।

`pip install -r requirements.txt` — এই কমান্ড দিলে সব একসাথে ইনস্টল হয়ে যায়!

---

## ⚙️ `hexashop/` ফোল্ডার — প্রজেক্টের হৃদয়

এই ফোল্ডারটা হলো পুরো প্রজেক্টের কন্ট্রোল রুম।

### 📁 `hexashop/settings/` — তিনটা মোড

```
settings/
├── base.py         ← সবার জন্য কমন সেটিং
├── development.py  ← ডেভেলপমেন্টের সময়
└── production.py   ← আসল সাইট চালানোর সময়
```

#### `base.py` — সবার ভিত্তি

```python
INSTALLED_APPS = [
    "apps.accounts",    # ব্যবহারকারী
    "apps.products",    # পণ্য
    "apps.cart",        # কার্ট
    "apps.wishlist",    # উইশলিস্ট
    "apps.notifications", # নোটিফিকেশন
    ...
]
```

**এটা কী করে?**

বাসা বানানোর সময় যেমন ব্লুপ্রিন্ট থাকে, এটা হলো তাই। এখানে বলা আছে:

- 🗃️ **ডেটাবেজ কোথায়?** PostgreSQL ব্যবহার করো, Redis দিয়ে ক্যাশ করো
- 🔐 **লগইন সিস্টেম কী?** JWT টোকেন, HttpOnly কুকিতে রাখো (হ্যাকারদের থেকে নিরাপদ)
- 📸 **ছবি কোথায় রাখবে?** Cloudinary-তে (ক্লাউডে)
- ⏱️ **টোকেন কতক্ষণ?** অ্যাক্সেস টোকেন ১৫ মিনিট, রিফ্রেশ টোকেন ৭ দিন
- 📧 **ইমেইল কীভাবে যাবে?** SendGrid দিয়ে

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/0",
        "TIMEOUT": 300,  # ৫ মিনিট ক্যাশে থাকবে
    }
}
```

**Redis ক্যাশ কী করে?** — ধরো প্রতিদিন ১০,০০০ মানুষ একই পণ্যের পেজ দেখছে। প্রতিবার ডেটাবেজ থেকে আনলে সার্ভার ক্লান্ত হয়ে পড়বে। তার বদলে প্রথমবার ডেটাবেজ থেকে এনে Redis-এ রেখে দাও। পরের ৯,৯৯৯ জন Redis থেকে পাবে — অনেক দ্রুত!

#### `development.py` — ডেভেলপারদের মোড

```python
DEBUG = True          # এরর দেখা যাবে পরিষ্কারভাবে
ALLOWED_HOSTS = ["*"] # যেকোনো জায়গা থেকে অ্যাক্সেস
AXES_ENABLED = False  # লগইন ব্লক বন্ধ (টেস্টের সুবিধায়)
```

**এটা কী করে?** — কোড লেখার সময় আমরা এই মোডে কাজ করি। এখানে সব এরর দেখা যায়, সিকিউরিটি একটু শিথিল থাকে যাতে সহজে টেস্ট করা যায়।

#### `production.py` — আসল সাইটের মোড

```python
DEBUG = False                        # এরর লুকিয়ে রাখো
SECURE_HSTS_SECONDS = 31536000      # ১ বছর HTTPS জোরদার
SESSION_COOKIE_SECURE = True         # কুকি শুধু HTTPS-এ
X_FRAME_OPTIONS = "DENY"            # iframe-এ লোড ব্লক
```

**এটা কী করে?** — এই মোডে সাইট একদম শক্ত-পোক্ত। হ্যাকাররা এরর দেখতে পাবে না, সব কমিউনিকেশন এনক্রিপ্টেড।

### `hexashop/urls.py` — ঠিকানার ডিরেক্টরি

```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/products/", include("apps.products.urls")),
    path("api/v1/cart/", include("apps.cart.urls")),
    path("api/v1/wishlist/", include("apps.wishlist.urls")),
    path("sitemap.xml", sitemap, ...),
    path("robots.txt", ...),
]
```

**এটা কী করে?**

ডাকঘরের মতো। যখন কেউ `hexashop.com/api/v1/products/` তে যায়, Django এই ফাইল দেখে বলে — "ওহ, এটা products অ্যাপে যাবে!" এটা হলো ট্র্যাফিক পরিচালকের মতো।

---

## 📁 `apps/accounts/` — ব্যবহারকারীর পুরো জগৎ

এই ফোল্ডারে আছে সব কিছু যা একজন ব্যবহারকারীর সাথে সম্পর্কিত — রেজিস্ট্রেশন, লগইন, প্রোফাইল, ঠিকানা।

### `models.py` — ডেটার নকশা

```python
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)  # ইমেইল দিয়ে লগইন
    avatar = models.ImageField(...)         # প্রোফাইল ছবি
    phone = models.CharField(...)           # ফোন নম্বর
    is_email_verified = models.BooleanField(default=False)
    USERNAME_FIELD = "email"  # ইউজারনেমের বদলে ইমেইল ব্যবহার
```

**এটা কী করে?**

ডেটাবেজে একজন ইউজারের "ঘর" বানায়। মডেল হলো ব্লুপ্রিন্টের মতো — বলে দেয় একজন ইউজারের কী কী তথ্য থাকবে।

আমরা ইউজারনেমের বদলে ইমেইল দিয়ে লগইন করি — এটা আরও সহজ!

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, ...)  # এক ইউজার, এক প্রোফাইল
    bio = models.TextField(blank=True)
    newsletter_subscribed = models.BooleanField(default=False)
```

**UserProfile কেন আলাদা?** — User মডেলে শুধু লগইনের কাজের জিনিস থাকে। বাকি ব্যক্তিগত তথ্য (বায়ো, নিউজলেটার) আলাদা টেবিলে রাখা পরিষ্কার এবং সহজ।

```python
class Address(models.Model):
    user = models.ForeignKey(User, ...)
    label = models.CharField(...)          # "বাড়ি" বা "অফিস"
    street_address = models.CharField(...)
    city = models.CharField(...)
    is_default = models.BooleanField()    # ডিফল্ট ঠিকানা?

    def save(self, *args, **kwargs):
        if self.is_default:
            # অন্য সব ঠিকানার ডিফল্ট বন্ধ করো
            Address.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs)
```

**চালাক কোড:** যদি কেউ একটা ঠিকানাকে ডিফল্ট করে, আগের ডিফল্ট অটোমেটিক বন্ধ হয়ে যায়। একজনের দুটো ডিফল্ট ঠিকানা থাকতে পারবে না!

```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, ...)
    action = models.CharField(...)    # "login", "logout", "register"
    ip_address = models.GenericIPAddressField()
```

**AuditLog কী?** — নিরাপত্তার জন্য লগ রাখা হয়। কে কখন লগইন করল, কোথা থেকে করল — সব রেকর্ড থাকে। সন্দেহজনক কিছু হলে খুঁজে বের করা যায়।

### `authentication.py` — গোপন চাবির গল্প

```python
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")  # কুকি থেকে টোকেন নাও
        if raw_token is None:
            return super().authenticate(request)  # হেডার দেখো
        validated = self.get_validated_token(raw_token)
        return self.get_user(validated), validated
```

**এটা কী করে?**

JWT (JSON Web Token) হলো একটা ডিজিটাল পরিচয়পত্র। কিন্তু এটা কোথায় রাখবে?

❌ **সমস্যা:** যদি JavaScript পড়তে পারে এমন জায়গায় রাখো → হ্যাকার XSS দিয়ে চুরি করতে পারে!

✅ **সমাধান:** HttpOnly কুকিতে রাখো → JavaScript পড়তে পারে না, হ্যাকার চুরি করতে পারে না!

আমাদের `CookieJWTAuthentication` কুকি থেকে টোকেন পড়ে। স্বাভাবিক `JWTAuthentication` হেডার থেকে পড়ে।

### `serializers.py` — ডেটার অনুবাদক

```python
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)  # কনফার্ম পাসওয়ার্ড

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)  # প্রোফাইল অটো তৈরি!
        return user
```

**সিরিয়ালাইজার কী?**

ধরো তুমি বাংলায় কথা বলছ, কিন্তু তোমার বন্ধু ইংরেজিতে বোঝে। দরকার একজন অনুবাদক।

- Python অবজেক্ট → JSON (API-তে পাঠানোর জন্য) → **সিরিয়ালাইজ**
- JSON → Python অবজেক্ট (ডেটাবেজে রাখার জন্য) → **ডিসিরিয়ালাইজ**

`write_only=True` মানে পাসওয়ার্ড ইনপুট নেবে কিন্তু কখনো রেসপন্সে পাঠাবে না — নিরাপদ!

### `views.py` — API-র রিসেপশনিস্ট

```python
class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # লগইন যাচাই করো
        serializer.is_valid(raise_exception=True)
        # কুকিতে টোকেন সেট করো
        response = Response(UserSerializer(user).data)
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,   # JavaScript পড়তে পারবে না
            secure=True,     # শুধু HTTPS-এ যাবে
            samesite="Lax",  # CSRF রক্ষা
        )
        # গেস্ট কার্ট মার্জ করো
        if guest_key:
            merge_guest_cart(guest_key, user)
        return response
```

**লগইন করলে কী হয়?**

১. ইমেইল ও পাসওয়ার্ড যাচাই হয়
২. দুটো টোকেন তৈরি হয় (অ্যাক্সেস: ১৫ মিনিট, রিফ্রেশ: ৭ দিন)
৩. টোকেন নিরাপদ কুকিতে সেট হয়
৪. অডিট লগে রেকর্ড হয়
৫. যদি আগে গেস্ট হিসেবে কিছু কার্টে ছিল, সেটা একাউন্টে মার্জ হয়!

### `admin.py` — অ্যাডমিন প্যানেলের সাজসজ্জা

```python
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_staff", "date_joined")
    search_fields = ("email", "username")
```

**এটা কী করে?** — Django-র অ্যাডমিন প্যানেল (`/admin/`) কে সুন্দর ও কার্যকর বানায়। ইউজারদের খুঁজতে পারবে, ফিল্টার করতে পারবে।

---

## 📁 `apps/products/` — পণ্যের পুরো দুনিয়া

এই ফোল্ডার হলো HEXASHOP-এর সবচেয়ে বড় ও গুরুত্বপূর্ণ অংশ।

### `models.py` — পণ্যের কাঠামো

#### Category — ক্যাটাগরি গাছ

```python
class Category(TimeStampedModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)         # URL-এ ব্যবহার হয়
    parent = models.ForeignKey("self", null=True) # নিজেই নিজের parent!
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    @property
    def full_path(self) -> str:
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
```

**গাছের মতো ক্যাটাগরি:**
```
Clothing (parent=None)
├── Hoodies (parent=Clothing)
│   ├── Zip Hoodies (parent=Hoodies)
│   └── Pullover Hoodies (parent=Hoodies)
└── Jackets (parent=Clothing)
```

`parent = ForeignKey("self")` — এই চালাক কোডের মাধ্যমে একটা ক্যাটাগরি নিজেই নিজের পেরেন্ট হতে পারে। যত লেভেল খুশি তত গভীর!

#### Product — পণ্যের তথ্য

```python
class Product(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)           # /products/hex-hoodie/
    sku = models.CharField(unique=True)            # স্টক কোড
    base_price = models.DecimalField(...)
    compare_at_price = models.DecimalField(...)    # আসল দাম (কাটা দাম)
    status = models.CharField(choices=Status.choices)  # draft/active/archived

    # দ্রুত কোয়েরির জন্য ডিনর্মালাইজড ডেটা
    avg_rating = models.DecimalField(...)          # গড় রেটিং (ক্যাশ)
    review_count = models.PositiveIntegerField()   # রিভিউ সংখ্যা (ক্যাশ)

    @property
    def discount_percentage(self) -> int | None:
        if self.compare_at_price and self.compare_at_price > self.base_price:
            return int((self.compare_at_price - self.base_price) / self.compare_at_price * 100)
        return None
```

**ডিনর্মালাইজেশন কী?**

সাধারণত রেটিং গণনা করতে সব রিভিউ জোড়া দিতে হয়। কিন্তু ১০,০০০ রিভিউ থাকলে প্রতিবার গণনা করা ধীর। তাই রেটিং আলাদাভাবে রেখে দিই (`avg_rating`) — নতুন রিভিউ আসলে আপডেট হয়।

```python
    class Meta:
        indexes = [
            models.Index(fields=["slug"]),           # slug দিয়ে দ্রুত খুঁজতে
            models.Index(fields=["status", "-created_at"]),  # সক্রিয় পণ্য, নতুন আগে
            models.Index(fields=["category", "status"]),
        ]
```

**ইনডেক্স কেন?** — বইয়ের সূচিপত্রের মতো। সূচিপত্র না থাকলে একটা বিষয় খুঁজতে পুরো বই পড়তে হবে। ইনডেক্স থাকলে সরাসরি পেজে চলে যাও!

#### ProductVariant — পণ্যের ভেরিয়েন্ট

```python
class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(Product, related_name="variants")
    sku = models.CharField(unique=True)          # HEX-001-M-BLK
    price = models.DecimalField(null=True)       # আলাদা দাম (না দিলে পণ্যের দাম)
    stock = models.PositiveIntegerField()        # স্টক কতটুকু
    low_stock_threshold = models.PositiveIntegerField(default=5)
    attributes = models.JSONField()              # {"size": "M", "color": "Black"}

    @property
    def effective_price(self):
        return self.price if self.price is not None else self.product.base_price

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.stock <= self.low_stock_threshold
```

**ভেরিয়েন্ট কেন?**

একটা হুডি আসে M, L, XL সাইজে এবং কালো, নীল রঙে। প্রতিটা কম্বিনেশন আলাদা স্টক রাখে। `attributes = {"size": "M", "color": "Black"}` দিয়ে যেকোনো ধরনের বৈশিষ্ট্য রাখা যায়।

### `serializers.py` — ডেটার রূপান্তর

```python
class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    def get_primary_image(self, obj) -> str | None:
        # প্রিফেচ করা ছবি ব্যবহার করো (অতিরিক্ত কোয়েরি বাঁচাও)
        images = getattr(obj, "prefetched_images", None)
        if images is None:
            img = obj.images.filter(is_primary=True).first()
        else:
            primary = [i for i in images if i.is_primary]
            img = primary[0] if primary else None
        return img.image.url if img else None
```

**দুটো আলাদা সিরিয়ালাইজার কেন?**

- `ProductListSerializer` — তালিকায় দেখানোর জন্য (কম ডেটা, দ্রুত)
- `ProductDetailSerializer` — একটা পণ্যের বিস্তারিত (বেশি ডেটা, ধীর কিন্তু সম্পূর্ণ)

এটা খুবই গুরুত্বপূর্ণ! ১০০টা পণ্যের লিস্টে প্রতিটার সব রিভিউ পাঠানোর দরকার নেই!

### `filters.py` — ফিল্টার সিস্টেম

```python
class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="base_price", lookup_expr="lte")
    size = django_filters.CharFilter(method="filter_size")

    def filter_size(self, queryset, name, value):
        return queryset.filter(
            variants__attributes__size__iexact=value,  # JSON ফিল্ড!
            variants__is_active=True,
            variants__stock__gt=0,  # স্টকে আছে এমন
        ).distinct()
```

**এটা কী করে?**

`/api/v1/products/?min_price=20&max_price=100&size=M&color=Black`

এই URL দিলে শুধু M সাইজের কালো পণ্য যেগুলো ২০ থেকে ১০০ ডলারের মধ্যে সেগুলো আসবে। ফিল্টার ক্লাস এই কাজটা স্বয়ংক্রিয়ভাবে করে!

### `views.py` — API-র মস্তিষ্ক

```python
class CategoryListView(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        cache_key = "category_tree"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)  # ক্যাশ থেকে দিয়ে দাও!

        roots = Category.objects.filter(parent=None, is_active=True)\
            .prefetch_related("children")  # এক কোয়েরিতেই সন্তানও আনো

        data = CategorySerializer(roots, many=True).data
        cache.set(cache_key, data, CATEGORY_TREE_TTL)  # ৬ ঘণ্টা ক্যাশে রাখো
        return Response(data)
```

**ক্যাশিং যেভাবে কাজ করে:**

```
প্রথম রিকোয়েস্ট:
ব্রাউজার → Django → ডেটাবেজ → Redis (সংরক্ষণ) → ব্রাউজার

পরের রিকোয়েস্ট (৬ ঘণ্টার মধ্যে):
ব্রাউজার → Django → Redis (তুলে নাও) → ব্রাউজার  ← অনেক দ্রুত!
```

```python
class ProductViewSet(ReadOnlyModelViewSet):
    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get("pk")
        cache_key = f"product_detail:{slug}"

        # ক্যাশে আছে কি?
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        product = Product.objects\
            .select_related("category", "brand")\     # JOIN করো (আলাদা কোয়েরি নয়)
            .prefetch_related("images", "variants")\  # সম্পর্কিত ডেটা একবারে আনো
            .get(slug=slug)

        # ভিউ কাউন্ট বাড়াও (আলাদা কোয়েরি, ক্যাশে প্রভাব নেই)
        Product.objects.filter(pk=product.pk).update(view_count=F("view_count") + 1)

        # সম্প্রতি দেখা পণ্য ট্র্যাক করো
        add_recently_viewed(user_key, product.id)

        data = ProductDetailSerializer(product).data
        cache.set(cache_key, data, PRODUCT_DETAIL_TTL)  # ১ ঘণ্টা
        return Response(data)
```

**`select_related` vs `prefetch_related` — পার্থক্য কী?**

ধরো পণ্যের সাথে ক্যাটাগরি ও ছবি দরকার।

❌ **সমস্যা (N+1 Problem):** ১০০টা পণ্য আনলে আবার ১০০টা আলাদা কোয়েরি ক্যাটাগরির জন্য = ২০১ কোয়েরি!

✅ **`select_related`:** SQL JOIN করে — ১ কোয়েরিতেই পণ্য + ক্যাটাগরি
✅ **`prefetch_related`:** আলাদা কোয়েরি করে কিন্তু বুদ্ধিমানের সাথে — ২ কোয়েরিতেই সব শেষ

### `sitemaps.py` — গুগলকে পথ দেখানো

```python
class ProductSitemap(Sitemap):
    changefreq = "daily"    # প্রতিদিন পরিবর্তন হয়
    priority = 0.9          # পণ্য পেজ খুব গুরুত্বপূর্ণ

    def items(self):
        return Product.objects.filter(status=Product.Status.ACTIVE)

    def location(self, obj):
        return f"/products/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at  # শেষ আপডেটের সময়
```

**Sitemap কেন দরকার?**

গুগলকে বলো — "আমার সাইটে এই এই পেজ আছে, এগুলো ইনডেক্স করো"। এতে SEO ভালো হয় এবং নতুন পণ্য দ্রুত গুগলে দেখায়।

### `tasks.py` — ছবি প্রসেসিং ব্যাকগ্রাউন্ডে

```python
@shared_task(queue="inventory", bind=True, max_retries=3)
def process_product_images(self, product_id: int) -> None:
    product = Product.objects.get(pk=product_id)
    for image in product.images.all():
        cloudinary.uploader.explicit(
            image.image.public_id,
            eager=[
                {"width": 800, "height": 800, "format": "webp"},  # বড় ছবি
                {"width": 400, "height": 400, "format": "webp"},  # মাঝারি
                {"width": 100, "height": 100, "format": "webp"},  # থাম্বনেইল
            ],
        )
```

**এটা কী করে?**

কেউ পণ্যের ছবি আপলোড করলে Celery ব্যাকগ্রাউন্ডে তিনটা সাইজ তৈরি করে Cloudinary-তে। ইউজারকে অপেক্ষা করতে হয় না।

WebP ফরম্যাট JPEG-এর চেয়ে ৩০% ছোট — পেজ দ্রুত লোড হয়!

### `admin.py` — অ্যাডমিনের শক্তি

```python
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "base_price", "status", "avg_rating")
    list_editable = ("status", "is_featured")    # তালিকা থেকেই সম্পাদনা!
    inlines = [ProductImageInline, ProductVariantInline]  # একই পেজে সব
    prepopulated_fields = {"slug": ("name",)}    # নাম লিখলে স্বয়ংক্রিয় slug
```

**এটা কী করে?** — অ্যাডমিন প্যানেলে পণ্য ম্যানেজ করা সুন্দর ও সহজ হয়। ছবি ও ভেরিয়েন্ট একই পেজে যোগ করা যায়।

---

## 📁 `apps/cart/` — শপিং কার্টের গল্প

### `models.py` — দুই ধরনের কার্ট

```python
class Cart(models.Model):
    user = models.OneToOneField(User, null=True, blank=True)  # লগইন করা ইউজার
    session_key = models.CharField(max_length=40, blank=True) # গেস্ট ইউজার

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items")
    product = models.ForeignKey(Product)
    variant = models.ForeignKey(ProductVariant, null=True)  # কোন ভেরিয়েন্ট?
    quantity = models.PositiveIntegerField(default=1)

    @property
    def line_total(self):
        return self.unit_price * self.quantity  # আইটেম মোট মূল্য
```

**ডেটাবেজে কার্ট কখন?** — লগইন করা ইউজারের কার্ট PostgreSQL-এ সংরক্ষিত থাকে।

### `utils.py` — গেস্ট কার্টের রহস্য

```python
def get_guest_cart(session_key: str) -> list[dict]:
    return cache.get(f"guest_cart:{session_key}", [])

def set_guest_cart(session_key: str, items: list[dict]) -> None:
    cache.set(f"guest_cart:{session_key}", items, CART_GUEST_TTL)  # ৭ দিন

def merge_guest_cart(session_key: str, user) -> None:
    guest_items = get_guest_cart(session_key)
    cart, _ = Cart.objects.get_or_create(user=user)
    for item in guest_items:
        variant = ProductVariant.objects.get(id=item["variant_id"])
        existing = CartItem.objects.filter(cart=cart, variant=variant).first()
        if existing:
            existing.quantity += item["quantity"]  # একই পণ্য? পরিমাণ বাড়াও
            existing.save()
        else:
            CartItem.objects.create(...)  # নতুন আইটেম যোগ করো
    cache.delete(f"guest_cart:{session_key}")  # গেস্ট কার্ট মুছে দাও
```

**গেস্ট কার্টের জাদু:**

```
গেস্ট কার্টে ৩টা পণ্য →
    লগইন করলো →
        ডেটাবেজ কার্টে মার্জ হলো →
            গেস্ট কার্ট Redis থেকে মুছে গেল
```

একজন ব্যবহারকারী যদি লগইন না করেই কার্টে পণ্য রাখে, লগইন করার পরেও সেগুলো থাকে! এটা খুব ব্যবহারকারী-বান্ধব।

### `views.py` — কার্ট API

```python
class CartView(APIView):
    def post(self, request):
        """কার্টে পণ্য যোগ করো"""
        if request.user.is_authenticated:
            # ডেটাবেজ কার্ট ব্যবহার করো
            cart, _ = Cart.objects.get_or_create(user=request.user)
            item, created = CartItem.objects.get_or_create(
                cart=cart, variant=variant,
                defaults={"product": variant.product, "quantity": 0},
            )
            new_qty = item.quantity + quantity
            if new_qty > variant.stock:
                return Response({"detail": "স্টকে এত নেই!"}, status=400)
            item.quantity = new_qty
            item.save()
        else:
            # Redis গেস্ট কার্ট ব্যবহার করো
            session_key = request.data.get("session_key")
            items = get_guest_cart(session_key)
            # ... পণ্য যোগ করো
            set_guest_cart(session_key, items)
```

---

## 📁 `apps/wishlist/` — স্বপ্নের তালিকা

### `models.py`

```python
class Wishlist(models.Model):
    user = models.OneToOneField(User, related_name="wishlist")  # এক ইউজার, এক উইশলিস্ট

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name="items")
    product = models.ForeignKey(Product)

    class Meta:
        unique_together = ("wishlist", "product")  # একই পণ্য দুইবার নয়!
```

### `views.py` — টগল করা

```python
class WishlistView(APIView):
    def post(self, request):
        """আছে তো সরাও, নেই তো যোগ করো"""
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist, product=product
        )
        if not created:
            item.delete()
            return Response({"in_wishlist": False})  # ❌ সরানো হলো

        return Response({"in_wishlist": True})  # ✅ যোগ করা হলো
```

**টগল কেন ভালো?** — একটা বাটনেই কাজ হয়। হার্ট আইকনে ক্লিক করলে যোগ হয়, আবার ক্লিক করলে সরে যায়।

---

## 📁 `apps/notifications/` — জানান দেওয়ার সিস্টেম

### `models.py`

```python
class StockAlert(models.Model):
    email = models.EmailField()
    variant = models.ForeignKey(ProductVariant, related_name="stock_alerts")
    status = models.CharField(choices=[("pending", ...), ("sent", ...), ("cancelled", ...)])
    sent_at = models.DateTimeField(null=True)

    class Meta:
        unique_together = ("email", "variant")  # একই ইমেইলে একই পণ্যে দুইবার নয়
```

### `tasks.py` — ইমেইল পাঠানো

```python
@shared_task(queue="emails", bind=True, max_retries=3, default_retry_delay=120)
def send_back_in_stock_alert(self, variant_id: int) -> None:
    alerts = StockAlert.objects.filter(variant_id=variant_id, status="pending")

    for alert in alerts:
        try:
            send_mail(
                subject=f"Back in Stock: {product.name}",
                message=f"সুখবর! পণ্যটি আবার পাওয়া যাচ্ছে: {product_url}",
                recipient_list=[alert.email],
            )
            alert.status = "sent"
            alert.sent_at = datetime.utcnow()
            alert.save()
        except Exception as exc:
            raise self.retry(exc=exc)  # ব্যর্থ হলে ২ মিনিট পরে আবার চেষ্টা
```

**`max_retries=3` কেন?** — নেটওয়ার্ক সমস্যায় ইমেইল না গেলে Celery নিজেই ৩ বার চেষ্টা করে। ব্যর্থ হলে লগে রেকর্ড করে।

### `views.py` — সাবস্ক্রাইব করা

```python
class StockAlertView(APIView):
    def post(self, request):
        if variant.stock > 0:
            return Response({"detail": "পণ্যটি এখন স্টকে আছে!"}, status=400)

        alert, created = StockAlert.objects.get_or_create(
            email=email,
            variant=variant,
        )
        return Response({"detail": "স্টকে আসলে জানানো হবে!"}, status=201)
```

---

## 📁 `core/` — সবার কাজে লাগে এমন টুলস

এই ফোল্ডারে এমন কোড আছে যা একাধিক অ্যাপ ব্যবহার করে।

### `cache.py` — স্মার্ট ক্যাশিং

```python
PRODUCT_DETAIL_TTL = 3600    # পণ্যের বিস্তারিত: ১ ঘণ্টা ক্যাশে
CATEGORY_TREE_TTL = 21600   # ক্যাটাগরি তালিকা: ৬ ঘণ্টা ক্যাশে
SEARCH_SUGGEST_TTL = 300    # সার্চ সাজেশন: ৫ মিনিট ক্যাশে

def add_recently_viewed(user_key: str, product_id: int, max_items: int = 20):
    viewed = cache.get(f"recently_viewed:{user_key}", [])
    if product_id in viewed:
        viewed.remove(product_id)  # আগে থাকলে সরাও
    viewed.insert(0, product_id)   # সামনে যোগ করো
    cache.set(f"recently_viewed:{user_key}", viewed[:20], RECENTLY_VIEWED_TTL)
```

**Recently Viewed কীভাবে কাজ করে?**

```
দেখলে: পণ্য ৫ → [৫]
দেখলে: পণ্য ৩ → [৩, ৫]
দেখলে: পণ্য ৭ → [৭, ৩, ৫]
আবার দেখলে: পণ্য ৩ → [৩, ৭, ৫]  ← সামনে আসে, ডুপ্লিকেট নেই
```

### `pagination.py` — পেজিনেশন

```python
class CursorSetPagination(CursorPagination):
    page_size = 24
    ordering = "-created_at"  # নতুন পণ্য আগে
```

**Cursor Pagination কেন Offset-এর চেয়ে ভালো?**

- ❌ **Offset Pagination:** "১০০ নম্বর থেকে শুরু করো" — ডেটাবেজকে ১০০টা গণনা করে বাদ দিতে হয়
- ✅ **Cursor Pagination:** "এই পণ্যের পরে যা আছে দাও" — সরাসরি সেখান থেকে শুরু!

বড় ডেটাসেটে Cursor অনেক দ্রুত। ইনফিনিট স্ক্রোলের জন্য একদম পারফেক্ট।

### `permissions.py` — কে কী দেখতে পারবে

```python
class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True  # অ্যাডমিন সবই পারে
        owner = getattr(obj, "user", getattr(obj, "owner", None))
        return owner == request.user  # নিজের জিনিস নিজে দেখতে পারবে
```

**এটা কী করে?** — তুমি শুধু তোমার নিজের অর্ডার, ঠিকানা দেখতে পারবে। অন্যেরটা দেখতে গেলে ৪০৩ এরর পাবে।

### `exceptions.py` — সুন্দর এরর মেসেজ

```python
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("অপ্রত্যাশিত সমস্যা!")
        return Response(
            {"detail": "একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।"},
            status=500,
        )

    response.data = {
        "detail": response.data.get("detail", response.data),
        "status_code": response.status_code,
    }
    return response
```

**এটা কী করে?** — সব এরর একটু সুন্দর করে ফরম্যাট করে পাঠায়। ব্যবহারকারী বোঝার মতো মেসেজ দেখে।

### `db_router.py` — ডেটাবেজ ট্রাফিক ম্যানেজার

```python
class ReadReplicaRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label in {"products", "cart", "wishlist"}:
            return "replica"  # পড়ার কাজ রেপ্লিকায়
        return "default"

    def db_for_write(self, model, **hints):
        return "default"  # লেখার কাজ মূল ডেটাবেজে
```

**Read Replica কী?**

ধরো তোমার একটা ডেটাবেজ সার্ভার আছে। হাজার হাজার মানুষ একসাথে পণ্য দেখছে → সার্ভার ক্লান্ত। তাই একটা কপি (Replica) বানাও, শুধু পড়ার কাজ সেখানে পাঠাও। মূল সার্ভারে শুধু লেখা হয়।

---

## 📁 `tests/` — টেস্ট কোড

### `test_products.py`

```python
@pytest.mark.django_db
class TestProductList:
    def test_filter_by_price(self, api_client, product):
        response = api_client.get("/api/v1/products/", {"min_price": 100})
        assert len(response.data["results"]) == 0  # ১০০ ডলারের বেশি নেই

    def test_draft_products_hidden(self, api_client):
        # ড্রাফট পণ্য সাধারণ ইউজার দেখতে পাবে না
        assert all(p["name"] != "Draft Product" for p in response.data["results"])
```

**টেস্ট কেন দরকার?**

টেস্ট হলো পরীক্ষার উত্তরপত্র। নতুন ফিচার যোগ করলে পুরনো কিছু নষ্ট হয়নি তো? টেস্ট চালাও, নিশ্চিত হও!

---

## 📁 `templates/` — HTML টেমপ্লেট

### `robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/        # গুগল API ক্রল করবে না
Disallow: /shop/?*sort= # ফিল্টার পেজ ইনডেক্স নয়

Sitemap: https://hexashop.com/sitemap.xml
```

**এটা কী করে?** — গুগল বট-কে বলে কোন পেজ দেখবে, কোনটা দেখবে না। Filter URL ইনডেক্স না করলে ডুপ্লিকেট কনটেন্ট সমস্যা হয় না।

---

## 🔄 সব একসাথে কীভাবে কাজ করে?

একজন ব্যবহারকারী "HEX Hoodie" কিনতে চাইলে যা হয়:

```
১. ব্রাউজার: GET /api/v1/products/hex-hoodie/
   ↓
২. urls.py: "এটা products অ্যাপে যাবে"
   ↓
৩. ProductViewSet.retrieve():
   ├── Redis-এ দেখো → আছে? সরাসরি পাঠাও (দ্রুত!)
   └── নেই? PostgreSQL থেকে আনো, Redis-এ রাখো
   ↓
৪. কার্টে যোগ: POST /api/v1/cart/
   ├── লগইন আছে? CartItem ডেটাবেজে রাখো
   └── গেস্ট? Redis-এ রাখো
   ↓
৫. লগইন করলো:
   ├── JWT টোকেন HttpOnly কুকিতে
   └── গেস্ট কার্ট ডেটাবেজে মার্জ
   ↓
৬. সব শেষে ইমেইল নোটিফিকেশন?
   └── Celery ব্যাকগ্রাউন্ডে পাঠাবে
```

---

## 🎯 মূল কথা — ৭টা স্মার্ট ডিজাইন সিদ্ধান্ত

| সিদ্ধান্ত | কারণ |
|---|---|
| **HttpOnly কুকিতে JWT** | হ্যাকার XSS দিয়ে টোকেন চুরি করতে পারবে না |
| **Redis ক্যাশে পণ্য তথ্য** | ডেটাবেজে চাপ কম, পেজ দ্রুত লোড |
| **Cursor Pagination** | ইনফিনিট স্ক্রোলে কখনো ডুপ্লিকেট দেখাবে না |
| **গেস্ট কার্ট Redis-এ** | লগইন ছাড়াও কার্ট কাজ করে, লগইনে মার্জ হয় |
| **Celery দিয়ে ইমেইল** | ইমেইল পাঠানোর জন্য ব্যবহারকারীকে অপেক্ষা করাবে না |
| **Read Replica Router** | পড়ার লোড কমে, সার্ভার দ্রুত থাকে |
| **ডিনর্মালাইজড রেটিং** | প্রতিবার সব রিভিউ গণনা না করে আগে থেকেই রেখে দাও |

---

## 🚀 চালু করার সহজ উপায়

```bash
# .env ফাইল বানাও
cp .env.example .env

# Docker দিয়ে সব চালু করো
docker compose up -d

# সুপারইউজার বানাও
docker compose exec backend python manage.py createsuperuser

# ব্রাউজারে খোলো
# API: http://localhost:8000/api/v1/
# অ্যাডমিন: http://localhost:8000/admin/
```

---

*এই আর্টিকেলটি HEXASHOP ব্যাকএন্ডের প্রতিটি কোণ বোঝার জন্য লেখা হয়েছে। Django-র শক্তি, Redis-এর গতি, Celery-র ধৈর্য — এই তিনটা মিলিয়েই তৈরি HEXASHOP-এর ব্যাকএন্ড।*

**লেখক:** HEXASHOP ডেভেলপমেন্ট টিম | তারিখ: ২০২৬
