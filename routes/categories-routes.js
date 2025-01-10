const express = require('express');
const { 
    findAllCategories, 
    // findProductById, 
    // createProduct, 
    // updateProduct, 
    // deleteProduct 
} = require('../controllers/shop/categories');

const categoriesRouter = express.Router();

// Route for getting all products from the database
categoriesRouter.get('/get', findAllCategories);

module.exports = categoriesRouter;