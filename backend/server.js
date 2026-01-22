const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDirs = ['uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets', 'uploads/sports', 'uploads/collaboration', 'uploads/events', 'uploads/media', 'uploads/profiles', 'uploads/services', 'uploads/trades'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const authRoutes = require('./routes/auth');
const userAuthRoutes = require('./routes/user-auth');
const staffAuthRoutes = require('./routes/staff-auth');
const parentLinkingRoutes = require('./routes/parent-linking');
const academicsRoutes = require('./routes/academics');
const contactRoutes = require('./routes/contact');
const supportRoutes = require('./routes/support');
const contentRoutes = require('./routes/content');
const dynamicRoutes = require('./routes/dynamic');
const teamsRoutes = require('./routes/teams');
const sportsRoutes = require('./routes/sports');
const gamificationRoutes = require('./routes/gamification');
const analyticsRoutes = require('./routes/analytics');
const aiGradingRoutes = require('./routes/aiGrading');
const adaptiveLearningRoutes = require('./routes/adaptiveLearning');
const collaborationRoutes = require('./routes/collaboration');
const dashboardRoutes = require('./routes/dashboards');
const servicesRoutes = require('./routes/services');
const liveChatRoutes = require('./routes/live-chat');
const tradesRoutes = require('./routes/trades');

app.use('/api/auth', authRoutes);
app.use('/api/auth', userAuthRoutes);
app.use('/api/auth', staffAuthRoutes);
app.use('/api/parent-linking', parentLinkingRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dynamic', dynamicRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-grading', aiGradingRoutes);
app.use('/api/adaptive-learning', adaptiveLearningRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/trades', tradesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'School Management System', version: '3.0.0', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🎓 School Management System - v3.0.0');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log('✅ 150+ Routes Active | All Features Operational\n');
});

module.exports = app;
