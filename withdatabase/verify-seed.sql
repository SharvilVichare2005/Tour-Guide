-- Check places table
SELECT COUNT(*) AS place_count FROM places;

-- Check destinations table
SELECT COUNT(*) AS destination_count FROM destinations;

-- Check a sample place
SELECT name, type, rating FROM places LIMIT 3;

-- Check a sample destination
SELECT title, description FROM destinations LIMIT 3;
