const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDirs = [
  'uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets',
  'uploads/dos', 'uploads/carousel', 'uploads/trades', 'uploads/gallery',
  'uploads/news', 'uploads/profiles', 'uploads/documents'
];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const authRoutes = require('./routes/auth');
let heroRoutes, contactRoutes, supportRoutes, academicsRoutes, contentRoutes, dynamicRoutes, teamsRoutes, sportsRoutes;
let gamificationRoutes, analyticsRoutes, aiGradingRoutes, adaptiveLearningRoutes, collaborationRoutes;
let dosRoutes, adminRoutes, rolesRoutes;

try { heroRoutes = require('./routes/hero'); } catch (e) { console.log('⚠️  Hero routes not found'); }
try { contactRoutes = require('./routes/contact'); } catch (e) { console.log('⚠️  Contact routes not found'); }
try { supportRoutes = require('./routes/support'); } catch (e) { console.log('⚠️  Support routes not found'); }
try { academicsRoutes = require('./routes/academics'); } catch (e) { console.log('⚠️  Academics routes not found'); }
try { contentRoutes = require('./routes/content'); } catch (e) { console.log('⚠️  Content routes not found'); }
try { dynamicRoutes = require('./routes/dynamic'); } catch (e) { console.log('⚠️  Dynamic routes not found'); }
try { teamsRoutes = require('./routes/teams'); } catch (e) { console.log('⚠️  Teams routes not found'); }
try { sportsRoutes = require('./routes/sports'); } catch (e) { console.log('⚠️  Sports routes not found'); }
try { gamificationRoutes = require('./routes/gamification'); } catch (e) { console.log('⚠️  Gamification routes not found'); }
try { analyticsRoutes = require('./routes/analytics'); } catch (e) { console.log('⚠️  Analytics routes not found'); }
try { aiGradingRoutes = require('./routes/aiGrading'); } catch (e) { console.log('⚠️  AI Grading routes not found'); }
try { adaptiveLearningRoutes = require('./routes/adaptiveLearning'); } catch (e) { console.log('⚠️  Adaptive Learning routes not found'); }
try { collaborationRoutes = require('./routes/collaboration'); } catch (e) { console.log('⚠️  Collaboration routes not found'); }
try { dosRoutes = require('./routes/dos'); } catch (e) { console.log('⚠️  DOS routes not found'); }
try { adminRoutes = require('./routes/admin'); } catch (e) { console.log('⚠️  Admin routes not found'); }
try { rolesRoutes = require('./routes/roles'); } catch (e) { console.log('⚠️  Roles routes not found'); }

app.use('/api/auth', authRoutes);
if (heroRoutes) app.use('/api/hero', heroRoutes);
if (contactRoutes) app.use('/api/contact', contactRoutes);
if (supportRoutes) app.use('/api/support', supportRoutes);
if (academicsRoutes) app.use('/api/academics', academicsRoutes);
if (contentRoutes) app.use('/api/content', contentRoutes);
if (dynamicRoutes) app.use('/api/dynamic', dynamicRoutes);
if (teamsRoutes) app.use('/api/teams', teamsRoutes);
if (sportsRoutes) app.use('/api/sports', sportsRoutes);
if (gamificationRoutes) app.use('/api/gamification', gamificationRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (aiGradingRoutes) app.use('/api/ai-grading', aiGradingRoutes);
if (adaptiveLearningRoutes) app.use('/api/adaptive-learning', adaptiveLearningRoutes);
if (collaborationRoutes) app.use('/api/collaboration', collaborationRoutes);
if (dosRoutes) app.use('/api/dos', dosRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (rolesRoutes) app.use('/api/roles', rolesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎓 Garden TVET School Management System');
  console.log('='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📡 Available Routes:');
  console.log('   - /api/auth          (Authentication)');
  console.log('   - /api/hero          (Hero Stats & Slides)');
  console.log('   - /api/admin         (Admin Management)');
  console.log('   - /api/dos           (DOS Management)');
  console.log('   - /api/roles         (All Role APIs)');
  console.log('   - /api/contact       (Contact Forms)');
  console.log('   - /api/support       (Support Tickets)');
  console.log('   - /api/academics     (Academic Management)');
  console.log('   - /api/content       (Content Management)');
  console.log('   - /api/dynamic       (Dynamic Content)');
  console.log('   - /api/teams         (Teams Management)');
  console.log('\n✅ All systems operational');
  console.log('='.repeat(60) + '\n');
});

module.exports = app;
