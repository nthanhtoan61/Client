const Cart = require("../../models/Cart");

const addtoCart = async (req, res) => {
    const { customerID, productID, variantID, quantity, createdAt } = req.body;

    if (!customerID || !productID || !variantID || !quantity) {
        return res.status(400).json({
            success: false,
            message: 'customerID, productID, variantID, quantity là bắt buộc',
        });
    }

    if (quantity > 10) {
        return res.status(400).json({
            success: false,
            message: '10 là số lượng lớn nhất cho phép',
        });
    }

    try {
        // Check if the cart item already exists
        const existingCart = await Cart.findOne({ customerID, productID, variantID });

        if (existingCart) {
            // If exists, update the quantity
            existingCart.quantity += quantity;
            const updatedCart = await existingCart.save();

            return res.status(200).json({
                success: true,
                message: 'Tăng thêm số lượng cho giỏ hàng đã tồn tại',
                data: updatedCart,
            });
        }

        // If not exists, create a new cart
        const cart = new Cart({
            customerID,
            productID,
            variantID,
            quantity,
            createdAt: createdAt || new Date(),
        });

        const savedCart = await cart.save();

        res.status(201).json({
            success: true,
            message: 'Tạo giỏ hàng thành công',
            data: savedCart,
        });
    } catch (error) {
        console.error('Lỗi khi tạo giỏ hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
        });
    }
};

module.exports = { addtoCart };