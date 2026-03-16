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
        const { name, email, password, phone, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password, phone, role });
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

        const user = await User.findOne({ where: { email } });
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
        res.json({ success: true, token, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        res.json({ success: true, data: req.user });
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
        const users = await User.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getProfile, updateProfile, getUsers };
