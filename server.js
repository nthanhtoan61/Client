const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('./connect');
const customersRouter = require('./routes/customers-auth-routes');
const adminsRouter = require('./routes/admins-auth-routes');
const productsRouter = require('./routes/products-routes');
const categoriesRouter = require('./routes/categories-routes');
const targetsRouter = require('./routes/targets-routes');
const cartRouter = require('./routes/cart-routes');


// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Kết nối MongoDB
(async () => {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('Không thể kết nối đến MongoDB:', error);
        process.exit(1); // Dừng server nếu không thể kết nối database
    }
})();

// Routes
app.use('/customer', customersRouter);
app.use('/admin', adminsRouter);
app.use('/product', productsRouter);
app.use('/category', categoriesRouter);
app.use('/target', targetsRouter);
app.use('/cart',cartRouter);

// Xử lý route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "Route không tồn tại" });
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
