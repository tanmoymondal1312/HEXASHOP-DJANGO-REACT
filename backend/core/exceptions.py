import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in %s", context.get("view"))
        return Response(
            {"detail": "An unexpected error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    response.data = {
        "detail": response.data.get("detail", response.data),
        "status_code": response.status_code,
    }
    return response
