-- Recommended: in all matters, there is NO 'Title' certificate in the last 30 days
SELECT m.id AS matter_id
FROM matters m
WHERE NOT EXISTS (
  SELECT 1
  FROM orders o
  JOIN certificates c ON c.order_id = o.id
  WHERE o.matter_id = m.id
    AND c.type = 'Title'
    AND c.created_at >= NOW() - INTERVAL '30 days'
)
ORDER BY m.id;