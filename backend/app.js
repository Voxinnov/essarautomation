const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true); // Allow all origins for dev simplicity
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files for uploads - served under /api/uploads to work through the Apache proxy
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // legacy fallback

const roles = require('./routes/roles');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roles', roles);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/work-updates', require('./routes/workUpdates'));
app.use('/api/time', require('./routes/time'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/remarks', require('./routes/remarks'));
app.use('/api/statuses', require('./routes/statuses'));
app.use('/api/bank-accounts', require('./routes/bankAccounts'));
app.use('/api/proforma', require('./routes/proforma'));
app.use('/api/company-profile', require('./routes/companyProfile'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/leaves', require('./routes/leaves'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Office Automation API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;
