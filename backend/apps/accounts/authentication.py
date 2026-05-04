from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """Read the access token from an HttpOnly cookie instead of the Authorization header."""

    ACCESS_COOKIE = "access_token"
    REFRESH_COOKIE = "refresh_token"

    def authenticate(self, request):
        raw_token = request.COOKIES.get(self.ACCESS_COOKIE)
        if raw_token is None:
            # Fall back to Authorization header for non-browser clients
            return super().authenticate(request)
        try:
            validated = self.get_validated_token(raw_token)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc
        return self.get_user(validated), validated
