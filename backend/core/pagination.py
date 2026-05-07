from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.response import Response


class CursorSetPagination(CursorPagination):
    """Cursor-based pagination — safe for infinite scroll, no offset drift."""

    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100
    ordering = "-created_at"

    def get_paginated_response(self, data):
        return Response(
            {
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "next": {"type": "string", "nullable": True},
                "previous": {"type": "string", "nullable": True},
                "results": schema,
            },
        }


class StandardPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
