UPDATE photos p
SET created_at = TIMESTAMPTZ '2026-09-18 12:00:00+00'
FROM spots s
WHERE p.spot_id = s.id AND p.author = 'Mikel Etxebarria' AND s.name = 'Gaztelugatxe';

UPDATE photos p
SET created_at = TIMESTAMPTZ '2026-09-22 12:00:00+00'
FROM spots s
WHERE p.spot_id = s.id AND p.author = 'Dirk Pothen' AND s.name = 'Tre Cime di Lavaredo';

UPDATE photos p
SET created_at = TIMESTAMPTZ '2026-09-08 12:00:00+00'
FROM spots s
WHERE p.spot_id = s.id AND p.author = 'Manuel' AND (s.name = 'Albarracín' OR s.name = 'Albarracin');

INSERT INTO photo_awards (id, period_type, period_label, period_start, period_end, rank, photo_id, author_id)
SELECT 'award-month-sep2026-2', 'month', 'Septiembre 2026', DATE '2026-09-01', DATE '2026-10-01', 2, p.id, 'dirk-pothen'
FROM photos p
JOIN spots s ON s.id = p.spot_id
WHERE p.author = 'Dirk Pothen' AND s.name = 'Tre Cime di Lavaredo'
ORDER BY p.likes DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO photo_awards (id, period_type, period_label, period_start, period_end, rank, photo_id, author_id)
SELECT 'award-month-sep2026-3', 'month', 'Septiembre 2026', DATE '2026-09-01', DATE '2026-10-01', 3, p.id, 'manuel'
FROM photos p
JOIN spots s ON s.id = p.spot_id
WHERE p.author = 'Manuel' AND (s.name = 'Albarracín' OR s.name = 'Albarracin')
ORDER BY p.likes DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;