const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const mongoDB = require('./config/database');
const { AuthRoutes } = require('./routes/auth.routes');

const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoDB.connect();

        const app = express();
        const PORT = process.env.PORT || 3000;

        // Middleware
        app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        app.use(express.json());
        app.use(cookieParser());
        
        // Routes
        app.use('/api/auth', AuthRoutes);
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        module.exports = app;
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message
    });
};

startServer();