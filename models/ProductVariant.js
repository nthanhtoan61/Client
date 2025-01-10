const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Liên kết tới collection Products
        required: true,
    },
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL', 'XXL'], // Chỉ cho phép chọn các kích thước có trong danh sách
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true, // Loại bỏ khoảng trắng thừa ở đầu và cuối
    },
    stock: {
        type: Number,
        required: true,
        min: 0, // Đảm bảo số lượng tồn kho ko < 0
    },
}, { timestamps: true });

// Đặt tên collection rõ ràng là 'product_variants'
const ProductVariant = mongoose.model('ProductVariant', ProductVariantSchema, 'product_variants');

module.exports = ProductVariant;
