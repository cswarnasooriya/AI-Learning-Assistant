import jwt from 'jsonwebtoken';
import User from '../models/User.js';


//generate JWT tokens
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc Register new user
// @route POST /api/auth/register
// @access Public

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        //Check if user ecxists
        const userExists = await User.findOne({ $or: [{ email }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error:
                    userExists.email === email ? "User already exists with this email" : "User already exists with this username",
                statuscode: 400,
            });
        }

        //Create new user
        const user = await User.create({
            username,
            email,
            password,
        });

        //Generate token
        const token = generateToken(user._id);

        //Send response
        res.status(201).json({
            success: true,
            statuscode: 201,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: "User registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        //validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide email and password",
                statuscode: 400,
            });
        }

        //check user
        const user = await User.findOne({ email }).select("+password");

        //check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                statuscode: 401,
            });
        }

        //check password
        const isMatch = await user.matchPassword(password);

        //check if password matches
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                statuscode: 401,
            });
        }

        //generate token
        const token = generateToken(user._id);

        //send response
        res.status(200).json({
            success: true,
            statuscode: 200,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token,
            message: "User logged in successfully",
        });

    } catch (error) {
        next(error);
    }
};

// @desc Get User profile
// @route GET /api/auth/profile
// @access Private

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                statuscode: 404,
            });
        }

        res.status(200).json({
            success: true,
            statuscode: 200,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            message: "User profile retrieved successfully",
        });

    } catch (error) {
        next(error);
    }
};

// @desc Update User profile
// @route PUT /api/auth/profile
// @access Private

export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                statuscode: 404,
            });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            statuscode: 200,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "User profile updated successfully",
        });

    } catch (error) {
        next(error);
    }
};

// @desc Change Password
// @route POST /api/auth/change-password
// @access Private

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Add .select('+password') to explicitly include the password field
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                statuscode: 404,
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Current password and new password are required",
                statuscode: 400,
            });
        }

        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid password",
                statuscode: 401,
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};