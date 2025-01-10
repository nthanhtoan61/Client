const express = require('express');
const {
    addtoCart,
} = require('../controllers/shop/cart');

const cartRouter = express.Router();

// Route for getting all products from the database
cartRouter.post('/add', addtoCart);

module.exports = cartRouter;