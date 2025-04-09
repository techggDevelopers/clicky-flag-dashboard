const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Echo back the request headers and body for debugging
router.post('/echo', (req, res) => {
    res.json({
        message: 'Echo response',
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 