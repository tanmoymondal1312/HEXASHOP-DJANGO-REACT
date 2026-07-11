# Database snapshot

`hexashop_db.sql` is a full PostgreSQL dump (schema + data: 65 products with
images, categories, brands, hero slides, users). Media files referenced by the
data live in `backend/media/` (tracked in git).

## Restore

```bash
# create role + db if needed
sudo -u postgres psql -c "CREATE ROLE hexashop_user LOGIN PASSWORD 'hexashop_password';"
sudo -u postgres psql -c "CREATE DATABASE hexashop_db OWNER hexashop_user;"

# load the snapshot
PGPASSWORD=hexashop_password psql -h 127.0.0.1 -U hexashop_user -d hexashop_db < hexashop_db.sql
```

Then point `backend/.env`'s `DATABASE_URL` at it:
`postgresql://hexashop_user:hexashop_password@localhost:5432/hexashop_db`

## Refresh the snapshot

```bash
PGPASSWORD=hexashop_password pg_dump -h 127.0.0.1 -U hexashop_user -d hexashop_db \
  --no-owner --no-privileges > backend/db_backup/hexashop_db.sql
```
