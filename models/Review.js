const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Liên kết tới collection Customer
        required: true,
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Liên kết tới collection Products
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Giá trị tối thiểu
        max: 5, // Giá trị tối đa
    },
    comment: {
        type: String,
        required: false, // Trường không bắt buộc
        trim: true,
    },
}, { timestamps: true });

// Đặt tên collection rõ ràng là 'reviews'
const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;