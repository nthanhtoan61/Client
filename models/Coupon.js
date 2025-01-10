const mongoose = require('mongoose');

// Định nghĩa schema cho collection 'coupons'
const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Mã coupon phải là duy nhất
        trim: true
    },
    description: {
        type: String,
        required: false // Mô tả không bắt buộc
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'], // Loại giảm giá: phần trăm hoặc số tiền cố định
        required: true
    },
    discountValue: {
        type: Number,
        required: true, // Giá trị giảm giá
        min: 0
    },
    minOrderValue: {
        type: Number,
        required: true, // Giá trị đơn hàng tối thiểu để áp dụng
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        required: true, // Số tiền giảm giá tối đa
        min: 0
    },
    startDate: {
        type: Date,
        required: true // Ngày bắt đầu hiệu lực
    },
    endDate: {
        type: Date,
        required: true // Ngày kết thúc hiệu lực
    },
    usageLimit: {
        type: Number,
        required: true, // Số lần sử dụng tối đa cho mỗi khách hàng
        min: 0,
        default: 1
    },
    totalUsageLimit: {
        type: Number,
        required: true, // Số lần sử dụng tối đa cho toàn bộ hệ thống
        min: 0
    },
    usedCount: {
        type: Number,
        required: true,
        default: 0 // Số lần đã được sử dụng
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true // Trạng thái kích hoạt
    },
    couponType: {
        type: String,
        enum: ['general', 'new_user', 'flash_sale', ' seasonal'], // Loại coupon: chung hoặc cụ thể cho sản phẩm
        required: true
    },
    minimumQuantity: {
        type: Number,
        required: true,
        default: 0 // Số lượng tối thiểu sản phẩm áp dụng
    },
    appliedProducts: {
        type: [mongoose.Schema.Types.ObjectId], // Danh sách ID sản phẩm áp dụng
        ref: 'Product',
        default: []
    },
    excludedProducts: {
        type: [mongoose.Schema.Types.ObjectId], // Danh sách ID sản phẩm không áp dụng
        ref: 'Product',
        default: []
    },
    appliedCategories: {
        type: [mongoose.Schema.Types.ObjectId], // Danh sách ID danh mục áp dụng
        ref: 'Category',
        default: []
    },
    excludedCategories: {
        type: [mongoose.Schema.Types.ObjectId], // Danh sách ID danh mục không áp dụng
        ref: 'Category',
        default: []
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model cho collection 'coupons'
const Coupon = mongoose.model('Coupon', CouponSchema, 'coupons');

// Xuất module
module.exports = Coupon;
