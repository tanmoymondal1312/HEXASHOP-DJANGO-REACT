import re

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Address, UserProfile

User = get_user_model()


def _validate_simple_password(value):
    if len(value) < 4:
        raise serializers.ValidationError("Password must be at least 4 characters.")
    if not re.search(r"[a-zA-Z]", value):
        raise serializers.ValidationError("Password must contain at least 1 letter.")


def _generate_username(email):
    base = email.split("@")[0]
    base = re.sub(r"[^a-zA-Z0-9_]", "", base)[:20] or "user"
    username = base
    i = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{i}"
        i += 1
    return username


def _split_full_name(full_name):
    parts = full_name.strip().split(None, 1)
    first_name = parts[0] if parts else ""
    last_name = parts[1] if len(parts) > 1 else ""
    return first_name, last_name


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, min_length=2)
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ("full_name", "email", "password")

    def validate_password(self, value):
        _validate_simple_password(value)
        return value

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")
        email = validated_data["email"]
        first_name, last_name = _split_full_name(full_name)
        username = _generate_username(email)
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
        )
        UserProfile.objects.create(user=user)
        return user


class FirebaseLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(write_only=True)

    def validate(self, attrs):
        id_token = attrs["id_token"]
        try:
            from firebase_admin import auth as fb_auth, initialize_app, _apps
            if not _apps:
                initialize_app()
            decoded = fb_auth.verify_id_token(id_token)
        except ImportError:
            raise serializers.ValidationError(
                "Firebase Admin SDK not installed. Run: pip install firebase-admin"
            )
        except Exception:
            raise serializers.ValidationError("Invalid or expired Firebase token.")
        attrs["firebase_user"] = decoded
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name",
            "avatar", "phone", "is_email_verified", "date_joined",
            "is_staff",
        )
        read_only_fields = ("id", "email", "is_email_verified", "date_joined", "is_staff")


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ("user", "bio", "date_of_birth", "newsletter_subscribed")


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "id", "label", "address_type", "full_name", "phone",
            "street_address", "city", "state", "postal_code", "country", "is_default",
        )

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["username"] = user.username
        return token
