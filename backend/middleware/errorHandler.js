const errorHandler = (err, req, res, next) => {
    let stausCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    //Mongoose bad ObjectId
    if(err.name === "CastError" ) {
        stausCode = 404;
        message = "Resource Not Found";
    }

    //Mongoose duplicate key
    if(err.code === 11000) {
        const field = Object.keys(err.keyvalue)[0];
        stausCode = 400;
        message = `${field} already exists` ;
    }

    //Mongoose validation error
    if(err.name === "ValidationError") {
        stausCode = 400;
        message = Object.values(err.errors).map((val => val.message).join(', '));
    }

    //Multer file size error
    if(err.code === 'LIMIT_FILE_SIZE'){
        stausCode = 400;
        message = "File size exceeds the maximum limit to 10MB";
    }

    //JWT error
    if(err.name === 'JsonWebTokenError'){
        stausCode = 401;
        message = "Invalid Token";
    }
    if(err.name === 'TokenExpiredError'){
        stausCode = 401;
        message = "Token expired";
    }

    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(stausCode).json({
        success: false,
        error: message,
        stausCode,
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    });
};


export default errorHandler;
    