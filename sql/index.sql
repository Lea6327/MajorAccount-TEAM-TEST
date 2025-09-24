-- Composite index that matches: order_id = ?, type = 'Title', created_at >= window
CREATE INDEX IF NOT EXISTS idx_certificates_orderid_type_createdat
ON certificates (order_id, type, created_at);

-- Optional (Postgres): partial index if 'Title' is rare
-- CREATE INDEX IF NOT EXISTS idx_certificates_orderid_createdat_title_only
-- ON certificates (order_id, created_at)
-- WHERE type = 'Title';