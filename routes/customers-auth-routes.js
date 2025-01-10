const express = require('express');
const { 
    loginCustomer, 
    registerCustomer, 
    logoutCustomer, 
    authMiddleware,
    updateAddress,
    getCustomerCoupons,
    createCouponForCustomer
} = require('../controllers/auth/customers-auth');

const customersRouter = express.Router();

// Route for customer login
customersRouter.post('/login', loginCustomer);

// Route for customer registration
customersRouter.post('/register', registerCustomer);

// Route for customer logout
customersRouter.get('/logout', logoutCustomer);

customersRouter.post('/adress/:id',updateAddress);

// Protected route example
customersRouter.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Truy cập thành công",
        data: req.customer,
    });
});


customersRouter.post('/coupon',getCustomerCoupons);

customersRouter.post('/coupon/create',createCouponForCustomer);




module.exports = customersRouter;
