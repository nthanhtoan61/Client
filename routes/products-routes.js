const express = require('express');
const { 
    findAllProducts, 
    layChiTietSanPham,
    danhSachSanPham
    // createProduct, 
    // updateProduct, 
    // deleteProduct 
} = require('../controllers/shop/products');

const productsRouter = express.Router();

// Route for getting all products from the database
productsRouter.get('/get', findAllProducts);
productsRouter.post('/detail', layChiTietSanPham);
productsRouter.get('/list', danhSachSanPham);

module.exports = productsRouter;