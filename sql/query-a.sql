-- Postgres
SELECT
  o.matter_id,
  COUNT(*) AS certificates_count
FROM certificates c
JOIN orders o ON o.id = c.order_id
WHERE c.created_at >= NOW() - INTERVAL '30 days'
GROUP BY o.matter_id
ORDER BY o.matter_id;