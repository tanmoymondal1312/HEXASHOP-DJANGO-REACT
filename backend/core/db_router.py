READ_REPLICA_APPS = {"products", "cart", "wishlist"}
READ_ONLY_METHODS = {"list", "retrieve"}


class ReadReplicaRouter:
    """Route SELECT queries for read-heavy apps to the replica."""

    def db_for_read(self, model, **hints):
        if model._meta.app_label in READ_REPLICA_APPS:
            return "replica"
        return "default"

    def db_for_write(self, model, **hints):
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == "default"
