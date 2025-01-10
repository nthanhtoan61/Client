const express = require('express');
const { 
    findAllTargets
} = require('../controllers/shop/targets');

const targetsRouter = express.Router();

// Route for getting all products from the database
targetsRouter.get('/get', findAllTargets);

module.exports = targetsRouter;