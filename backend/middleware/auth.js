import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    //check if token exists in Authorization header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        try {
            token = req.headers.authorization.split(' ')[1];

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            //get user from the decoded token
             req.user = await User.findById(decoded.id).select('-password');
            
            //check if user exists
            if(!req.user){
                return res.status(401).json({
                    success: false,
                    error: "User Not Found..!",
                    statuscode: 401,
                });
            }
          
            //call next middleware
            next();
            
        } catch (error) {
            console.error('Auth middleware error:' ,error.message);
            
            if(error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: "Token has expired",
                    statuscode: 401,
                });
            }

            return res.status(401).json({
                success: false,
                error: "Not Authorized, Invalid token",
                statuscode: 401,
            });
        }
    }

    if(!token) {
        return res.status(401).json({
            success: false,
            error: "Not Authorized, No token found",
            statuscode: 401,
        });
    }
};

export default protect;