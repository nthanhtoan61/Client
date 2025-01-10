const Admin = require("../../models/Admin");
const bcrypt = require('bcrypt');//mã hoá mk
const jwt = require('jsonwebtoken');//token


//login
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email và mật khẩu là bắt buộc",
        });
    }

    try {
        // Tìm kiếm người dùng theo username
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại! Vui lòng đăng ký trước",
            });
        }


        // So sánh mật khẩu
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu không chính xác! Vui lòng thử lại",
            });
        }

        

        // Tạo JWT Token
        const token = jwt.sign(
            {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                phone: admin.phone,
            },
            process.env.CLIENT_SECRET_KEY || "default_secret_key", // Sử dụng biến môi trường hoặc giá trị mặc định
            { expiresIn: "1d" } // Token hết hạn sau 1 giờ
        );

        // Cấu hình cookie options
        const cookieOptions = {
            httpOnly: true, // Cookie chỉ có thể được truy cập bởi máy chủ
            secure: process.env.NODE_ENV === "production", // Chỉ bật secure trên môi trường production
            sameSite: "strict", // Cookie chỉ được gửi trong cùng một site (bảo vệ CSRF)
        };

        // Gửi token trong cookie và trả về phản hồi
        res.cookie("authToken", token, cookieOptions).status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                phone: admin.phone,
                isDisable: admin.isDisable,
                createAt: admin.createAt,
                updateAt: admin.updateAt,
            },
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng nhập:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
        });
    }
};

const registerAdmin = async (req, res) => {
    const { username, email, password, phone } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Họ tên, email và mật khẩu là bắt buộc",
        });
    }

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng",
            });
        }

        // Mã hóa mật khẩu
        const hashPassword = await bcrypt.hash(password, 12);

        // Tạo admin mới
        const newAdmin = new Admin({
            username,
            email,
            password: hashPassword,
            phone: phone || null,
            isDisable: false,
            createAt: new Date(),
            updateAt: new Date(),
        });

        // Lưu người dùng vào database
        await newAdmin.save();

        // Phản hồi thành công
        res.status(200).json({
            success: true,
            message: "Đăng ký thành công",
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng ký:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
        });
    }
};
// Logout Admin
const logoutAdmin = (req, res) => {
    res.clearCookie("authToken").json({
        success: true,
        message: "Đăng xuất thành công",
    });
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin chưa được xác thực!",
            });
        }

        // Xác minh token
        const decoded = jwt.verify(
            token,
            process.env.CLIENT_SECRET_KEY || "default_secret_key"
        );

        // Gắn thông tin admin vào request
        req.admin = decoded;

        // Chuyển tiếp đến middleware hoặc route tiếp theo
        next();
    } catch (error) {
        console.error("Lỗi xác thực:", error);
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};
module.exports = { loginAdmin, registerAdmin, logoutAdmin, authMiddleware };
