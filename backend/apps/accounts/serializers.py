from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Address, UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "username", "first_name", "last_name", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name",
            "avatar", "phone", "is_email_verified", "date_joined",
        )
        read_only_fields = ("id", "email", "is_email_verified", "date_joined")


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
