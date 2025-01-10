const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
    target: {
        type: String,
        required: true,
        enum: ['Nam', 'Nữ'], // Chỉ chấp nhận các giá trị "Nam" hoặc "Nữ"
        trim: true,
    },
}, { timestamps: true },);

const Target = mongoose.model('Target', TargetSchema,'targets');

module.exports = Target;
