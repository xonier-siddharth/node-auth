const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const Otp = require('../models/otp.model');
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require("../utils/jwt");

class UserService {
    async register(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw customError('Email is already registered', 400);
        }

        const user = await User.create(userData);
        return user;
    }

    async requestLoginOtp({ email, password, role }) {
        await this.validateUserAndPassword(email, password, role);

        const otp = generateOtp();
        await sendOtpEmail(email, otp);

        const otpExpireAt = Date.now() + 10 * 60 * 1000; // Set OTP expiration time (10 minutes)

        const otpEntry = new Otp({
            email,
            otp,
            expiration: otpExpireAt
        });
        await otpEntry.save();

        return true;
    }

    async verifyLoginOtp({ email, otp, password, role }) {
        const otpData = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (process.env.NODE_ENV == 'development') {
            if (otp != '123456')
                throw customError('Invalid OTP', 400);
        } else {
            if (!otpData)
                throw customError('No OTP sent to this email', 400);
            if (otp !== otpData.otp)
                throw customError('Invalid OTP', 400);
            if (Date.now() > otpData.expiration)
                throw customError('OTP has expired', 400);
        }


        const user = await this.validateUserAndPassword(email, password, role);

        if (!user.emailVerifiedAt) {
            user.emailVerifiedAt = new Date();
            await user.save();
        }

        const accessToken = generateAccessToken(user._id, role);
        const refreshToken = generateRefreshToken(user._id);

        return {
            returnData: {
                user,
                accessToken,
            },
            refreshToken
        };
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) throw customError('No refresh token provided', 400);

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) throw customError('Invalid refresh token', 400);

        const user = await User.findById(decoded.id);
        if (!user) throw customError('User not found', 400);

        const accessToken = generateAccessToken(user._id, 'user');
        return { accessToken };
    }

    async validateUserAndPassword(email, password) {
        const user = await User.findOne({ email });
        if (!user)
            throw customError('User not found', 400);

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw customError('Invalid password', 400);
        }

        return user;
    }
}

const customError = (message, statusCode = 500, code = null) => {
    const error = new Error(message);
    error.code = code || 500;
    error.statusCode = statusCode;
    return error;
};

async function sendOtpEmail(email, otp) {
    const mailOptions = {
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    try {
        await sendEmail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${email}: ${error.message}`);
        throw new Error(`Failed to send OTP email to ${email}: ${error.message}`);
    }
}

function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().padStart(6, '0');
}

async function sendEmail({ to, subject, text, html }) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
        throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
}

exports.UserService = UserService;