const mongoose = require('mongoose');
//mongoose cung cấp ORM với các tính năng như schema, validation, và middleware.
const uri = "mongodb+srv://toan:toan123@clothesstore.cmkp5.mongodb.net/ClothesStore";

async function connectToDatabase() {
    try {
        await mongoose.connect(uri); // Không cần truyền các tùy chọn `useNewUrlParser` và `useUnifiedTopology`
        console.log('Kết nối MongoDB thành công!');
    } catch (error) {
        console.error('Lỗi khi kết nối MongoDB:', error);
        throw error;
    }
}

module.exports = connectToDatabase;
