const User = require('../models/User');
const UserFlag = require('../models/UserFlag');
const Flag = require('../models/Flag');
const jwt = require('jsonwebtoken');

// Max login attempts before locking account
const MAX_LOGIN_ATTEMPTS = 5;
// Lock time in minutes
const LOCK_TIME = 30;

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with that email or username'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        // Save user - password will be hashed by pre-save hook
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user info and token
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if account is locked
        const lockedUntil = user.lockUntil && new Date(user.lockUntil) > new Date();

        if (lockedUntil) {
            const remainingTime = Math.ceil((new Date(user.lockUntil) - new Date()) / (1000 * 60));
            return res.status(401).json({
                message: 'Account is locked due to too many failed attempts',
                locked: true,
                remainingTime,
            });
        }

        // Special case for danger mode with special password
        if (password === 'danger1234') {
            // Reset login attempts and set danger mode
            user.loginAttempts = 0;
            user.lockUntil = null;
            user.isDangerMode = true;
            await user.save();

            // Get the danger flag (F1)
            const dangerFlag = await Flag.findOne({ name: 'F1' });
            if (!dangerFlag) {
                return res.status(500).json({ message: 'Danger flag not found' });
            }

            // Disable all other flags for this user
            await UserFlag.updateMany(
                { userId: user._id },
                { enabled: false }
            );

            // Enable the danger flag for this user
            await UserFlag.findOneAndUpdate(
                { userId: user._id, flagName: 'F1' },
                { enabled: true },
                { upsert: true, new: true }
            );

            // Create JWT token with danger mode flag
            const token = jwt.sign(
                { id: user._id, role: user.role, isDangerMode: true },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isDangerMode: true
                }
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Increment login attempts
            user.loginAttempts += 1;

            // Check if max attempts reached
            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME * 60 * 1000);
                await user.save();

                return res.status(401).json({
                    message: 'Account locked due to too many failed attempts',
                    locked: true,
                    remainingTime: LOCK_TIME
                });
            }

            await user.save();

            return res.status(401).json({
                message: 'Invalid email or password',
                attemptsRemaining: MAX_LOGIN_ATTEMPTS - user.loginAttempts
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user info and token
        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user data
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isDangerMode: req.isDangerMode || false
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}; 