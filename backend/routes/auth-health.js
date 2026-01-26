const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', message: 'Auth service is running' });
});

module.exports = router;
