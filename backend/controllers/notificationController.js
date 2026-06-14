const { Notification } = require('../models');
const { sseClients } = require('../utils/notifications');

// @desc    Get all user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Notification.findAndCountAll({
            where: { user_id: req.user.id },
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'DESC']]
        });

        const unreadCount = await Notification.count({
            where: { user_id: req.user.id, read: false }
        });

        res.json({
            success: true,
            count,
            unreadCount,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await notification.update({ read: true });
        res.json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.update(
            { read: true },
            { where: { user_id: req.user.id, read: false } }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

// @desc    Establish Server-Sent Events stream for real-time notifications
// @route   GET /api/notifications/stream
// @access  Private
const sseStream = async (req, res, next) => {
    try {
        const userId = req.user.id;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        if (!sseClients.has(userId)) {
            sseClients.set(userId, []);
        }
        sseClients.get(userId).push(res);

        // Send initial connection event
        res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

        // Keep connection active with comments
        const pingInterval = setInterval(() => {
            res.write(': ping\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(pingInterval);
            const clients = sseClients.get(userId) || [];
            const index = clients.indexOf(res);
            if (index !== -1) {
                clients.splice(index, 1);
            }
            if (clients.length === 0) {
                sseClients.delete(userId);
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    sseStream
};
