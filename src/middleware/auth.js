const { verifyAccessToken } = require("../utils/jwt");
const User = require('../models/user.model');

const authorize = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                const error = new Error("Unauthorized: Auth token missing");
                error.statusCode = 401;
                next(error)
            }
            
            const token = authHeader.split(" ")[1] || null;
            const decoded = verifyAccessToken(token);
            if (!decoded) {
                const error = new Error("Unauthorized: Invalid token");
                error.statusCode = 401;
                next(error)
            }
            
            const user = await User.findById(decoded.id);
            if (!user) {
                const error = new Error("User not found");
                error.statusCode = 401;
                next(error)
            }
            
            
            if (!allowedRoles.includes(user.role)) {
                const error = new Error("Forbidden: You do not have access");
                error.statusCode = 403;
                next(error)
            }
            
            req.user = user;
            next();
        } catch (error) {
            error.message = "Unauthorized: Token verification failed";
            error.statusCode = 401;
            next(error)
        }
    };
};

module.exports = authorize;
