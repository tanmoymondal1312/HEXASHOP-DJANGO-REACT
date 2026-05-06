_SKIP_PREFIXES = ("/admin/", "/panel/", "/health/", "/metrics", "/static/", "/media/")


class PageViewMiddleware:
    """Record every frontend API GET as a page-view for the dashboard chart."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            request.method == "GET"
            and request.path.startswith("/api/v1/")
            and response.status_code == 200
            and not any(request.path.startswith(p) for p in _SKIP_PREFIXES)
        ):
            try:
                from apps.admin_panel.models import PageView
                PageView.objects.create(
                    path=request.path,
                    ip=self._get_ip(request),
                )
            except Exception:
                pass  # never crash a request due to analytics

        return response

    @staticmethod
    def _get_ip(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
