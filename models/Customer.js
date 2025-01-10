const mongoose = require('mongoose');

// Định nghĩa schema cho collection 'customers'
const CustomerSchema = new mongoose.Schema({
    password: { 
        type: String, 
        required: true // Mật khẩu là bắt buộc
    },
    email: { 
        type: String, 
        required: true, // Email là bắt buộc
        unique: true // Email phải là duy nhất
    },
    phone: { 
        type: String, 
        required: false // Số điện thoại không bắt buộc
    },
    fullname: { 
        type: String, 
        required: true // Họ và tên là bắt buộc
    },
    sex: { 
        type: String, 
        enum: ['Nam', 'Nữ', 'Không xác định'], // Giới tính chỉ được chọn từ các giá trị này
        required: true // Giới tính là bắt buộc
    },
    isDisable: { 
        type: Boolean, 
        default: false // Trạng thái vô hiệu hóa, mặc định là false
    },
}, { 
    timestamps: true // Tự động thêm trường createdAt và updatedAt
});

// Tạo model cho collection 'customers'
const Customer = mongoose.model('Customer', CustomerSchema, 'customers');

// Xuất module
module.exports = Customer;
