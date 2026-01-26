@echo off
echo ========================================
echo Setting up News Articles with Images
echo ========================================
echo.

cd backend
node scripts/setup-news-articles.js

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo News articles have been added to the database.
echo Images are located in: backend/uploads/news/
echo.
echo API Endpoints available:
echo - GET    /api/news           - Get all articles
echo - GET    /api/news/:id       - Get single article
echo - POST   /api/news           - Create new article
echo - PUT    /api/news/:id       - Update article
echo - DELETE /api/news/:id       - Delete article
echo - POST   /api/news/:id/view  - Track view
echo - POST   /api/news/:id/like  - Like article
echo.
pause
