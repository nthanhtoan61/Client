const express = require('express');
const { 
    loginAdmin, 
    registerAdmin, 
    logoutAdmin, 
    authMiddleware 
} = require('../controllers/auth/admins-auth');

const adminsRouter = express.Router();

// Route for admin login
adminsRouter.post('/login', loginAdmin);

// Route for admin registration
adminsRouter.post('/register', registerAdmin);

// Route for admin logout
adminsRouter.get('/logout', logoutAdmin);

// Protected route example
adminsRouter.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Truy cập thành công",
        data: req.admin,
    });
});

module.exports = adminsRouter;
