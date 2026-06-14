const { Notification } = require('../models');

// In-memory map of userId -> array of express res objects
const sseClients = new Map();

/**
 * Send a notification to a specific user.
 * Saves to the database and streams real-time to active SSE clients.
 */
const sendNotification = async (userId, title, message, type = 'general', data = null) => {
    if (!userId) return null;
    try {
        const notification = await Notification.create({
            user_id: userId,
            title,
            message,
            type,
            data
        });

        // Broadcast to user's active SSE connections
        const clients = sseClients.get(userId);
        if (clients && clients.length > 0) {
            const payload = JSON.stringify(notification);
            clients.forEach(res => {
                res.write(`data: ${payload}\n\n`);
            });
        }
        return notification;
    } catch (error) {
        console.error('❌ Error in sendNotification:', error);
        return null;
    }
};

module.exports = { sseClients, sendNotification };
