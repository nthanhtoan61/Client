const mongoose = require('mongoose');

// Định nghĩa schema cho collection 'addresses'
const AddressSchema = new mongoose.Schema({
    customerID: {
        type: mongoose.Schema.Types.ObjectId, // Liên kết với collection 'customers'
        ref: 'Customer',
        required: true
    },
    address: {
        type: String, // Địa chỉ không bắt buộc
        default: "" // Mặc định là chuỗi rỗn
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model cho collection 'addresses'
const Address = mongoose.model('Address', AddressSchema, 'addresses');

// Xuất module
module.exports = Address;
