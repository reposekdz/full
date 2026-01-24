const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDirs = [
  'uploads', 'uploads/contact', 'uploads/assignments', 'uploads/tickets',
  'uploads/leadership', 'uploads/students', 'uploads/teachers', 'uploads/staff',
  'uploads/gallery', 'uploads/events', 'uploads/certificates', 'uploads/documents',
  'uploads/developers', 'uploads/sports', 'uploads/trades'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const routes = {
  auth: './routes/auth',
  leadership: './routes/leadership',
  'comprehensive-db': './routes/comprehensive-database',
  'dynamic-system': './routes/dynamic-system',
  students: './routes/students',
  teachers: './routes/teachers',
  academics: './routes/academics',
  finance: './routes/finance',
  contact: './routes/contact',
  support: './routes/support',
  developers: './routes/developers',
  sports: './routes/sports',
  trades: './routes/trades'
};

const mountedRoutes = [];
Object.entries(routes).forEach(([path, routePath]) => {
  try {
    const route = require(routePath);
    app.use(`/api/${path}`, route);
    mountedRoutes.push(path);
  } catch (e) {
    console.log(`⚠️  ${path} route not found`);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Garden TVET School Management System',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    routes: mountedRoutes
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
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
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`✅ Active Routes: ${mountedRoutes.join(', ')}`);
  console.log('='.repeat(60) + '\n');
});

module.exports = app;
