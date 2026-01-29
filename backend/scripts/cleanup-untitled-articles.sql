-- Delete untitled articles from news_articles table
DELETE FROM news_articles 
WHERE title IS NULL 
   OR title = '' 
   OR title = 'Untitled';

-- Show remaining articles count
SELECT COUNT(*) as remaining_articles FROM news_articles;
