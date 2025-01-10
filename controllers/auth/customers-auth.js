const Customer = require("../../models/Customer");
const bcrypt = require('bcrypt');//mã hoá mk
const jwt = require('jsonwebtoken');//token
const Customer_Coupon = require("../../models/CustomerCoupons");
const Coupon = require("../../models/Coupon");
const { default: mongoose } = require("mongoose");
const CustomerCoupon = require("../../models/CustomerCoupons");
const Address = require("../../models/Adress");


//login
const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email và mật khẩu là bắt buộc",
        });
    }

    try {
        // Tìm kiếm người dùng theo email
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Người dùng không tồn tại! Vui lòng đăng ký trước",
            });
        }

        // So sánh mật khẩu
        const isPasswordMatch = await bcrypt.compare(password, customer.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu không chính xác! Vui lòng thử lại",
            });
        }

        // Kiểm tra nếu tài khoản bị vô hiệu hóa
        if (customer.isDisable) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa",
            });
        }

        // Tạo JWT Token
        const token = jwt.sign(
            {
                id: customer._id,
                email: customer.email,
                fullname: customer.fullname,
                phone: customer.phone,
                sex: customer.sex,
            },
            process.env.CLIENT_SECRET_KEY || "default_secret_key", // Sử dụng biến môi trường hoặc giá trị mặc định
            { expiresIn: "7d" } // Token hết hạn sau 1 giờ
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
                id: customer._id,
                fullname: customer.fullname,
                email: customer.email,
                phone: customer.phone,
                sex: customer.sex,
                isDisable: customer.isDisable,
                createAt: customer.createAt,
                updateAt: customer.updateAt,
            },
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng nhập:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
        });
    }
}

const registerCustomer = async (req, res) => {
    const { fullname, email, password, phone, sex } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullname || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Họ tên, email và mật khẩu là bắt buộc"
        });
    }

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới
        const newCustomer = new Customer({
            fullname,
            email,
            password: hashPassword,
            phone: phone || null,
            sex: sex || "Không xác định",
            isDisable: false,
            createAt: new Date(),
            updateAt: new Date(),
        });

        // Lưu khách hàng vào database
        const savedCustomer = await newCustomer.save();

        // Tạo một địa chỉ rỗng trong collection 'addresses'
        const emptyAddress = new Address({
            customerID: savedCustomer._id, // Liên kết với khách hàng mới
            address: "", // Địa chỉ rỗng
            isDefault: false, // Không phải địa chỉ mặc định
            isDelete: false // Địa chỉ còn hiệu lực
        });

        // Lưu địa chỉ rỗng vào database
        await emptyAddress.save();

        // Phản hồi thành công
        res.status(200).json({
            success: true,
            message: "Đăng ký thành công",
            data: savedCustomer
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng ký:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
        });
    }
};

const logoutCustomer = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: "Đăng xuất thành công",
    });
};

const authMiddleware = (req, res, next) => {
    try {
        // Lấy token từ cookie
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Người dùng chưa được xác thực!",
            });
        }

        // Xác minh token
        const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY || "default_secret_key");

        // Gắn thông tin người dùng vào request
        req.customer = decoded;

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

const updateAddress = async (req, res) => {
    try {
        const customerID = req.params.id;
        const { address, isDefault } = req.body; // Địa chỉ mới và trạng thái mặc định

        // Kiểm tra nếu địa chỉ không được cung cấp
        if (!address) {
            return res.status(400).json({
                status: 'fail',
                message: 'Address là bắt buộc khi nhập'
            });
        }

        // Kiểm tra xem customerID có tồn tại trong collection customers không
        const customerExists = await Customer.findById(customerID);
        if (!customerExists) {
            return res.status(404).json({
                status: 'fail',
                message: 'ID người dùng không hợp lệ hoặc không tồn tại'
            });
        }

        // Tìm địa chỉ của khách hàng trong collection addresses
        const existingAddress = await Address.findOne({ customerID: customerID });

        if (existingAddress) {
            // Cập nhật địa chỉ và isDefault
            existingAddress.address = address;
            existingAddress.isDefault = isDefault || false;
            await existingAddress.save();
        } else {
            // Nếu chưa tồn tại, thêm mới vào collection addresses
            const newAddress = new Address({
                customerID: customerID,
                address,
                isDefault: isDefault || false
            });
            await newAddress.save();
        }

        // Trả về kết quả thành công
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật địa chỉ thành công'
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ:", error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi hệ thống',
            error: error.message
        });
    }
};


const getCustomerCoupons = async (req, res) => {
    const { customerID } = req.body;

    // Kiểm tra xem `customerID` có được gửi hay không
    if (!customerID) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp customerID.",
        });
    }

    try {
        // Kiểm tra xem khách hàng có tồn tại không
        const existingCustomer = await Customer.findById(customerID);
        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: "Khách hàng không tồn tại.",
            });
        }

        // Lấy danh sách `CustomerCoupon` của khách hàng
        const customerCoupons = await CustomerCoupon.find({ customerID })
            .populate("couponID", "code discountPercent") // Lấy thông tin từ collection `Coupon`
            .lean();

        // Nếu khách hàng không có coupon nào
        if (customerCoupons.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Khách hàng chưa có coupon nào.",
                data: [],
            });
        }

        // Phản hồi danh sách coupon
        res.status(200).json({
            success: true,
            message: "Lấy danh sách coupon thành công.",
            data: customerCoupons,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách CustomerCoupon:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống.",
        });
    }
};

const createCouponForCustomer = async (req, res) => {
    const { code, discountPercent, durationInDays = 3, customerID } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!code || !discountPercent || !customerID) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp đầy đủ thông tin: code, discountPercent, customerID.',
        });
    }

    try {
        // Kiểm tra xem customer có tồn tại không
        const customerExists = await Customer.findById(customerID);
        if (!customerExists) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại.',
            });
        }
        // Kiểm tra nếu mã coupon đã tồn tại
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(409).json({
                success: false,
                message: 'Mã Coupon đã tồn tại.',
            });
        }

        // Tạo ngày bắt đầu và kết thúc
        const validFrom = new Date();
        const validTo = new Date();
        validTo.setDate(validFrom.getDate() + durationInDays);

        // Tạo một Coupon mới
        const newCoupon = new Coupon({
            code,
            discountPercent,
            validFrom,
            validTo,
        });

        // Lưu Coupon vào database
        const savedCoupon = await newCoupon.save();
        // Kiểm tra xem `CustomerCoupon` đã tồn tại chưa (tránh trùng lặp)
        const existingCustomerCoupon = await Customer_Coupon.findOne({
            customerID: customerID,
            couponID: savedCoupon._id,
        });

        if (existingCustomerCoupon) {
            return res.status(409).json({
                success: false,
                message: 'Coupon này đã được gán cho khách hàng.',
            });
        }

        // Tạo một CustomerCoupon liên kết với Coupon
        const newCustomerCoupon = new Customer_Coupon({
            customerID,
            couponID: savedCoupon._id,
            usage_left: 1,
            is_expired: false,
        });

        // Lưu CustomerCoupon vào database
        const savedCustomerCoupon = await newCustomerCoupon.save();

        res.status(201).json({
            success: true,
            message: 'Tạo Coupon và CustomerCoupon thành công.',
            data: {
                coupon: savedCoupon,
                customerCoupon: savedCustomerCoupon,
            },
        });


    } catch (error) {
        console.error('Lỗi khi tạo Coupon và CustomerCoupon:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống.',
        });
    }
};


module.exports = { loginCustomer, registerCustomer, logoutCustomer, authMiddleware, updateAddress, getCustomerCoupons, createCouponForCustomer };
