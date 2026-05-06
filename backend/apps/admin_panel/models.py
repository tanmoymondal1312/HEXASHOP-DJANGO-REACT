from django.db import models


class PageView(models.Model):
    """Lightweight page-view tracker — recorded by middleware on every API GET."""

    path = models.CharField(max_length=500)
    ip = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Page View"
        verbose_name_plural = "Page Views"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.ip} → {self.path} @ {self.timestamp}"
