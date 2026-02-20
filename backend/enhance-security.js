const fs = require('fs');
const path = require('path');

console.log('🚀 Enhancing Security...\n');

const securityMiddleware = `const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

module.exports = { limiter, authLimiter };`;

const middlewareDir = path.join(__dirname, 'middleware');
fs.mkdirSync(middlewareDir, { recursive: true });
fs.writeFileSync(path.join(middlewareDir, 'security.js'), securityMiddleware);

console.log('✅ Created security middleware');
console.log('✨ Security enhanced!');
