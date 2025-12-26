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
    try{
        const {username, email, password} = req.body;

        //Check if user ecxists
        const userExists = await User.findOne({$or: [{email}] });

        if(userExists){
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
            message: "User registered successfully",
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
        });
    }catch(error) {
     next(error);
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
    try{

    }catch(error) {
     next(error);
    }
};

// @desc Get User profile
// @route GET /api/auth/profile
// @access Private

export const getProfile = async (req, res, next) => {
    try{

    }catch(error) {
     next(error);
    }
};

// @desc Update User profile
// @route PUT /api/auth/profile
// @access Private

export const updateProfile = async (req, res, next) => {
    try{

    }catch(error) {
     next(error);
    }
};

// @desc Change Password
// @route POST /api/auth/change-password
// @access Private

export const changePassword = async (req, res, next) => {
    try{

    }catch(error) {
     next(error);
    }
};