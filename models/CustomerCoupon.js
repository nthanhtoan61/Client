const mongoose = require('mongoose');

// Định nghĩa schema cho collection 'CustomerCoupons'
const CustomerCouponSchema = new mongoose.Schema({
    couponID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon', // Liên kết với collection 'Coupon'
        required: true
    },
    customerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Liên kết với collection 'Customer'
        required: true
    },
    usageLeft: {
        type: Number,
        required: true,
        default: 3 // Số lần sử dụng còn lại, mặc định là 0
    },
    isExpired: {
        type: Boolean,
        required: true,
        default: false // Mặc định là chưa hết hạn
    },
    status: {
        type: String,
        enum: ['available', 'used', 'expired'], // Trạng thái của coupon
        required: true,
        default: 'available'
    },
    usageHistory: {
        type: [Date], // Lịch sử các lần sử dụng (danh sách ngày giờ)
        default: [] // Mặc định là mảng rỗng
    },
    lastUsedDate: {
        type: Date, // Ngày sử dụng cuối cùng
        default: new Date(0) // Mặc định là 1970-01-01
    },
    expiryDate: {
        type: Date, // Ngày hết hạn của coupon
        required: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model cho collection 'CustomerCoupons'
const CustomerCoupon = mongoose.model('CustomerCoupon', CustomerCouponSchema, 'customer_coupons');

// Xuất module
module.exports = CustomerCoupon;
