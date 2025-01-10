const mongoose = require("mongoose");

// Định nghĩa schema cho giỏ hàng (cart)
const cartSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId, // Kiểu ObjectId, liên kết đến khách hàng
        ref: 'Customer', // Tham chiếu đến collection 'Customer'
        required: true, // Bắt buộc phải có
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId, // Kiểu ObjectId, liên kết đến sản phẩm
        ref: 'Products', // Tham chiếu đến collection 'Products'
        required: true, // Bắt buộc phải có
    },
    variantID: {
        type: mongoose.Schema.Types.ObjectId, // Kiểu ObjectId, liên kết đến biến thể sản phẩm
        ref: 'ProductVariants', // Tham chiếu đến collection 'ProductVariants'
        required: true, // Bắt buộc phải có
    },
    quantity: {
        type: Number, // Số lượng sản phẩm trong giỏ hàng
        required: true, // Bắt buộc phải có
        min: 1, // Giá trị tối thiểu là 1
    },
    createdAt: {
        type: Date, // Ngày tạo
        default: Date.now, // Mặc định là ngày giờ hiện tại
    },
});

// Tạo model cho collection 'carts' (giỏ hàng)
const Cart = mongoose.model('Cart', cartSchema, 'carts');

// Xuất module để sử dụng trong các file khác
module.exports = Cart;
