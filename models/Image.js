const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    imageURL: {
        type: String,
        required: true, // Bắt buộc phải có đường dẫn ảnh
        trim: true, // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    },
    isThumbnail: {
        type: Boolean,
        default: false, // Mặc định không phải ảnh thu nhỏ (thumbnail)
    },
    variantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariants', // Tham chiếu tới collection ProductVariants
        required: false, // Không bắt buộc
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products', // Tham chiếu tới collection Products
        required: true, // Bắt buộc phải có mã sản phẩm
    },
}, { timestamps: true }); // Tự động thêm trường createdAt và updatedAt

// Đặt tên collection rõ ràng là 'images'
const Image = mongoose.model('Image', ImageSchema, 'images');

module.exports = Image;
