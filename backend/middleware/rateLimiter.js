const rateLimit = require('express-rate-limit');

// Rate limiters disabled for testing - set to very high limits
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10000, // 10,000 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return true; // Skip rate limiting for all requests
  }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10000,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return true; // Skip rate limiting for all requests
  }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: 'API rate limit exceeded, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return true; // Skip rate limiting for all requests
  }
});

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: 'Too many file uploads, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return true; // Skip rate limiting for all requests
  }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: 'Too many search requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return true; // Skip rate limiting for all requests
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter
};
