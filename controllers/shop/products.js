const mongoose = require('mongoose');
const Review = require('../../models/Review');
const Product = require('../../models/Product');
const ProductVariant = require('../../models/ProductVariant');
const Image = require('../../models/Image');

// Lấy tất cả bản ghi từ một collection
const findAllProducts = async (req, res) => {
    try {
      const listOfProducts = await Product.find({});
      res.status(200).json({
        success: true,
        data: listOfProducts,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy dữ liệu từ Products",
      });
    }
};

const layChiTietSanPham = async (req, res) => {
    try {
        const { productID } = req.body; // Extract productID from request body

        // Validate productID
        if (!mongoose.Types.ObjectId.isValid(productID)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }

        // Find the product
        const product = await Product.findById(productID).lean();
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        // Find product variants
        const variants = await ProductVariant.find({ productID }).lean();

    

        // Fetch images for each variant
        const variantImages = await Promise.all(
            variants.map(async (variant) => {
                const images = await Image.find({ productID, variantID: variant._id }).lean();
                return { variantID: variant._id.toString(), images };
            })
        );

        // Fetch product reviews with customer information
        const reviews = await Review.aggregate([
            { $match: { productID: new mongoose.Types.ObjectId(productID) } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerID',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    customer: {
                        _id: '$customer._id',
                        email: '$customer.email',
                    },
                },
            },
        ]);

        // Prepare and send response
        res.status(200).json({
            product: {
                _id: product._id,
                name: product.name,
                description: product.description,
                price: product.price,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            },
            variants: variants.map((variant) => {
                const variantImage = variantImages.find((vi) => vi.variantID === variant._id.toString());
                return {
                    ...variant,
                    images: variantImage ? variantImage.images : [],
                };
            }),
            reviews,
        });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
    }
};


const danhSachSanPham = async (req, res) => {
    try {
        const { pageNumber = 1, sortType = 'newest', filterType = 'all', searchTerm = '' } = req.query;

        // Parse pageNumber thành số nguyên và kiểm tra tính hợp lệ
        const page = parseInt(pageNumber, 10);
        if (isNaN(page) || page < 1) {
            return res.status(400).json({ message: 'Số trang không hợp lệ.' });
        }

        const limit = 6; // Số lượng sản phẩm mỗi trang
        const skip = (page - 1) * limit;

        // Sắp xếp
        let sortStage = {};
        switch (sortType) {
            case 'newest':
                sortStage = { createdAt: -1 };
                break;
            case 'oldest':
                sortStage = { createdAt: 1 };
                break;
            case 'highestPrice':
                sortStage = { price: -1 };
                break;
            case 'lowestPrice':
                sortStage = { price: 1 };
                break;
            case 'highestRating':
                sortStage = { rating: -1 };
                break;
            default:
                sortStage = { createdAt: -1 }; // Mặc định sắp xếp theo mới nhất
                break;
        }

        // Lọc
        let filter = {};
        if (filterType !== 'all') {
            filter = { 'target.target': filterType === 'nam' ? 'Nam' : 'Nữ' };
        }

        // Tìm kiếm
        const searchRegExp = new RegExp(searchTerm, 'i'); // Tìm kiếm không phân biệt chữ hoa/thường
        const searchFilter = { 'product.name': { $regex: searchRegExp } };

        // Pipelines cho aggregation
        const pipeline = [
            { $match: { isThumbnail: true } }, // Lọc chỉ hình thumbnail
            {
                $lookup: {
                    from: 'products',
                    localField: 'productID',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.categoryID',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'targets',
                    localField: 'product.targetID',
                    foreignField: '_id',
                    as: 'target',
                },
            },
            { $unwind: '$target' },
            {
                $match: {
                    $and: [
                        filter,       // Lọc theo Nam/Nữ
                        searchFilter, // Tìm kiếm theo tên sản phẩm
                    ],
                },
            },
            {
                $project: {
                    _id: '$product._id',
                    name: '$product.name',
                    price: '$product.price',
                    rating: '$product.rating',
                    categoryName: '$category.name',
                    target: '$target.target',
                    imageURL: '$imageURL',
                    createdAt: '$product.createdAt',
                },
            },
        ];

        // Đếm tổng số sản phẩm trước khi phân trang
        const totalProducts = await Image.aggregate([...pipeline, { $count: 'total' }]).exec();
        const totalCount = totalProducts.length > 0 ? totalProducts[0].total : 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Thêm sắp xếp, phân trang
        pipeline.push({ $sort: sortStage });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        // Lấy dữ liệu sản phẩm
        const products = await Image.aggregate(pipeline).exec();

        res.status(200).json({
            products,
            totalPages,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm: ', error.message);
        res.status(500).json({ message: 'Lỗi hệ thống: ', error: error.message });
    }
};



module.exports = { findAllProducts , layChiTietSanPham, danhSachSanPham };