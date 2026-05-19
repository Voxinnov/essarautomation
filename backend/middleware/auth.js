const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        if (req.user.status === 'inactive') {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

const hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const { Role } = require('../models');
            if (req.user.role === 'admin') return next(); // Admin always has access

            if (!req.user.roleId) {
                return res.status(403).json({ success: false, message: 'Forbidden: No role assigned' });
            }

            const role = await Role.findByPk(req.user.roleId);
            if (!role || !role.permissions.includes(permission)) {
                return res.status(403).json({ success: false, message: `Forbidden: Missing required permission: ${permission}` });
            }
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
};

module.exports = { protect, authorize, hasPermission };
