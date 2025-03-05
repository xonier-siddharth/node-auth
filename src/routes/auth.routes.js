const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const {
    validateUserRegistration,
    validateRequestLoginOtp,
    validateVerifyLogin
} = require('../middleware/validation');
const authorize = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

router.post(
    '/register',
    validateUserRegistration,
    authController.register
);

router.post(
    '/request-login-otp',
    validateRequestLoginOtp,
    authController.requestLoginOtp
);

router.post(
    '/login',
    validateVerifyLogin,
    authController.verifyLoginOtp
);

router.post(
    '/refresh-token',
    authController.refreshToken
);

router.get('/protected-route', authorize(['user']), (req, res) => {
    res.json({
        message: 'You are in!',
        user: req.user
    })
})

exports.AuthRoutes = router;