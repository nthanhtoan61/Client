const mongoose = require('mongoose');

// Định nghĩa schema cho bảng quản trị viên (admins)
const AdminSchema = new mongoose.Schema({
    username: { 
        type: String, // Tên người dùng
        required: true, // Bắt buộc phải có
    },
    password: { 
        type: String, // Mật khẩu của quản trị viên
        required: true, // Bắt buộc phải có
    },
    email: { 
        type: String, // Địa chỉ email
        required: true, // Bắt buộc phải có
        unique: true, // Không được trùng lặp
    },
    phone: { 
        type: String, // Số điện thoại
        required: true, // Bắt buộc phải có
    },
}, { 
    timestamps: true, // Tự động thêm trường `createdAt` và `updatedAt`
});

// Tạo model liên kết với schema AdminSchema và collection `admins`
const Admin = mongoose.model('Admin', AdminSchema, 'admins');

// Xuất module để sử dụng trong các file khác
module.exports = Admin;
