const { UserService } = require("../services/user.service");

class AuthController {
    constructor() {
        this.userService = new UserService();
    }

    register = async (req, res, next) => {
        try {
            const payload = req.body;
            const response = await this.userService.register(payload);
            customResponse(res, 'Registration successful', response);
        } catch (error) {
            next(error);
        }
    };

    requestLoginOtp = async (req, res, next) => {
        try {
            const payload = {
                ...req.body,
                role: 'user'
            };
            await this.userService.requestLoginOtp(payload);
            customResponse(res, 'OTP sent for login');
        } catch (error) {
            next(error);
        }
    };

    verifyLoginOtp = async (req, res, next) => {
        try {
            const payload = {
                ...req.body,
                role: 'user'
            };
            const response = await this.userService.verifyLoginOtp(payload);

            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            customResponse(res, 'Logged in successful', response.returnData);
        } catch (error) {
            next(error);
        }
    };

    refreshToken = async (req, res, next) => {
        try {
            const response = await this.userService.refreshToken(req);
            customResponse(res, 'Token refreshed successful', response);
        } catch (error) {
            next(error);
        }
    };
}

const customResponse = (res, message, data = null, status = true) => {
    const response = {
        status: status,
        message: message,
        data: data
    };

    res.json(response);
};

exports.AuthController = AuthController;
