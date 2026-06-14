const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private (Admin only)
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, roleId } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password, phone, role, roleId });
        const token = generateToken(user.id);

        res.status(201).json({ success: true, token, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ 
            where: { email },
            include: [{ model: require('../models').Role, as: 'roleData' }] 
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status === 'inactive') {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }

        const token = generateToken(user.id);
        // Include the role's permissions explicitly for clear frontend handling
        const permissions = user.roleData?.permissions || [];
        // Inject permissions into returned user payload dynamically
        const userData = { ...user.toJSON(), permissions };
        res.json({ success: true, token, data: userData });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: require('../models').Role, as: 'roleData' }]
        });
        const permissions = user?.roleData?.permissions || [];
        const userData = { ...user?.toJSON(), permissions };
        res.json({ success: true, data: userData });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, password } = req.body;
        const user = await User.findByPk(req.user.id);
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (password) user.password = password;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({ 
            include: [{ model: require('../models').Role, as: 'roleData' }],
            order: [['createdAt', 'DESC']] // Updated field name
        });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user details by admin
// @route   PUT /api/auth/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, roleId, status } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (role) user.role = role;
        if (roleId) user.roleId = roleId;
        if (status) user.status = status;
        if (password) user.password = password;

        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile, updateProfile, getUsers, deleteUser, updateUser };
