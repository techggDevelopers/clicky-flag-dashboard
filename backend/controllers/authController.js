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
        console.log('Login attempt with:', {
            email: req.body.email,
            hasPassword: !!req.body.password,
            body: JSON.stringify(req.body)
        });

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

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
            console.log('Special password used - activating danger mode');

            // Use findByIdAndUpdate instead of save to avoid validation issues
            await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        loginAttempts: 0,
                        lockUntil: null,
                        isDangerMode: true
                    }
                }
            );

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
            const userFlag = await UserFlag.findOneAndUpdate(
                { userId: user._id, flagName: 'F1' },
                { enabled: true },
                { upsert: true, new: true }
            );
            console.log('Set danger flag for user:', userFlag);

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

        console.log('Checking password...');
        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');

        if (!isMatch) {
            // Increment login attempts - use findOneAndUpdate to avoid validation issues
            await User.findByIdAndUpdate(
                user._id,
                {
                    $inc: { loginAttempts: 1 },
                    $set: {
                        lockUntil: user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS ?
                            new Date(Date.now() + LOCK_TIME * 60 * 1000) : user.lockUntil
                    }
                }
            );

            // Get updated login attempts
            const updatedUser = await User.findById(user._id);

            // Check if max attempts reached
            if (updatedUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                return res.status(401).json({
                    message: 'Account locked due to too many failed attempts',
                    locked: true,
                    remainingTime: LOCK_TIME
                });
            }

            return res.status(401).json({
                message: 'Invalid email or password',
                attemptsRemaining: MAX_LOGIN_ATTEMPTS - updatedUser.loginAttempts
            });
        }

        // Reset login attempts on successful login - use findOneAndUpdate to avoid validation issues
        await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    loginAttempts: 0,
                    lockUntil: null
                }
            }
        );

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful, returning token and user data');
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
        console.error('Login error details:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            message: 'Server error during login',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
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