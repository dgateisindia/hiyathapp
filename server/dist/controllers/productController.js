"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProducts = exports.importProductsCSV = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getMyProductRating = exports.rateProduct = exports.getProduct = exports.searchProducts = exports.getProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = require("@clerk/express");
const ProductRating_1 = __importDefault(require("../models/ProductRating"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const Products_1 = __importDefault(require("../models/Products"));
const order_1 = __importDefault(require("../models/order"));
const user_1 = __importDefault(require("../models/user"));
const uploadReviewImage_1 = require("../utils/uploadReviewImage");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const xlsx_1 = __importDefault(require("xlsx"));
// Get all products
// GET /api/products
const getProducts = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const sort = String(req.query.sort || "default");
        const query = {
            isActive: true
        };
        let sortOptions;
        if (sort === "lowToHigh") {
            sortOptions = {
                price: 1,
                _id: 1
            };
        }
        else if (sort === "highToLow") {
            sortOptions = {
                price: -1,
                _id: 1
            };
        }
        else {
            sortOptions = {
                createdAt: -1,
                _id: -1
            };
        }
        const total = await Products_1.default.countDocuments(query);
        const products = await Products_1.default.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getProducts = getProducts;
// Search products by name 
const searchProducts = async (req, res) => {
    try {
        const q = String(req.query.q || '');
        const sort = String(req.query.sort || 'default');
        const filter = {
            isActive: true
        };
        if (q.trim()) {
            filter.$or = [
                {
                    title: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    name: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: q,
                        $options: 'i'
                    }
                },
                {
                    category: {
                        $regex: q,
                        $options: 'i'
                    }
                }
            ];
        }
        const sortOptions = sort === 'lowToHigh'
            ? {
                price: 1,
                _id: 1
            }
            : sort === 'highToLow'
                ? {
                    price: -1,
                    _id: 1
                }
                : {
                    createdAt: -1,
                    _id: -1
                };
        const products = await Products_1.default.find(filter)
            .sort(sortOptions);
        res.json({
            success: true,
            data: products
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.searchProducts = searchProducts;
// Get single product 
// GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const rawId = req.params.id;
        const productId = Array.isArray(rawId)
            ? rawId[0]
            : rawId;
        if (!productId ||
            !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        const [product, reviews] = await Promise.all([
            Products_1.default.findOne({
                _id: productId,
                isActive: true
            }).lean(),
            ProductRating_1.default.find({
                product: productId
            })
                .select('userId rating review images createdAt updatedAt')
                .sort({ createdAt: -1 })
                .lean()
        ]);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                ...product,
                reviews: reviews.map((item) => ({
                    _id: item._id,
                    userId: item.userId,
                    rating: item.rating,
                    review: item.review || '',
                    images: item.images || [],
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                }))
            }
        });
    }
    catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({
            success: false,
            message: error.message ||
                'Unable to fetch product'
        });
    }
};
exports.getProduct = getProduct;
const rateProduct = async (req, res) => {
    try {
        const { userId: clerkUserId } = (0, express_1.getAuth)(req);
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to rate this product'
            });
        }
        const { id } = req.params;
        const orderId = String(req.body.orderId ?? '').trim();
        const rating = Number(req.body.rating);
        const review = String(req.body.review ?? '').trim();
        const files = req.files ?? [];
        /*
         * Validate product ID.
         */
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        /*
         * Validate order ID.
         */
        if (!orderId ||
            !mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order ID'
            });
        }
        /*
         * Validate rating.
         */
        if (!Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a whole number between 1 and 5'
            });
        }
        /*
         * Validate review.
         */
        if (review.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Review must contain at least 3 characters'
            });
        }
        if (review.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Review cannot exceed 1000 characters'
            });
        }
        if (files.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 review images are allowed'
            });
        }
        const productObjectId = new mongoose_1.default.Types.ObjectId(id);
        const orderObjectId = new mongoose_1.default.Types.ObjectId(orderId);
        /*
         * Verify product.
         */
        const product = await Products_1.default.findOne({
            _id: productObjectId,
            isActive: true
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        /*
         * Find MongoDB user using Clerk ID.
         */
        const mongoUser = await user_1.default.findOne({
            clerkId: clerkUserId
        }).select('_id');
        if (!mongoUser) {
            return res.status(404).json({
                success: false,
                message: 'User account not found'
            });
        }
        /*
         * Verify:
         * 1. Order belongs to logged-in user.
         * 2. Order is delivered.
         * 3. Product exists in that order.
         */
        const purchasedOrder = await order_1.default.findOne({
            _id: orderObjectId,
            user: mongoUser._id,
            orderStatus: 'delivered',
            items: {
                $elemMatch: {
                    product: productObjectId
                }
            }
        }).select('_id');
        if (!purchasedOrder) {
            return res.status(403).json({
                success: false,
                message: 'You can review only delivered products that you purchased'
            });
        }
        /*
         * Find existing rating before uploading
         * or replacing review images.
         */
        const existingRating = await ProductRating_1.default.findOne({
            product: productObjectId,
            userId: clerkUserId
        }).select('images');
        const previousImages = (existingRating?.images ?? []).map(image => ({
            url: image.url,
            publicId: image.publicId
        }));
        /*
         * Upload new review images.
         */
        const uploadedImages = [];
        for (const file of files) {
            const uploadedImage = await (0, uploadReviewImage_1.uploadReviewImage)(file.buffer);
            uploadedImages.push(uploadedImage);
        }
        /*
         * Prepare review update.
         */
        const updateData = {
            rating,
            review
        };
        /*
         * New images replace old images.
         *
         * When no images are selected,
         * existing review images remain unchanged.
         */
        if (uploadedImages.length > 0) {
            updateData.images =
                uploadedImages;
        }
        /*
         * Create or update the user's review.
         */
        const savedRating = await ProductRating_1.default.findOneAndUpdate({
            product: productObjectId,
            userId: clerkUserId
        }, {
            $set: updateData
        }, {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true
        });
        if (!savedRating) {
            /*
             * Remove newly uploaded images if
             * MongoDB failed to save the review.
             */
            if (uploadedImages.length > 0) {
                await (0, uploadReviewImage_1.deleteReviewImages)(uploadedImages);
            }
            return res.status(500).json({
                success: false,
                message: 'Unable to save the product review'
            });
        }
        /*
         * Delete previous Cloudinary images only
         * after the new review is saved successfully.
         */
        if (uploadedImages.length > 0 &&
            previousImages.length > 0) {
            await (0, uploadReviewImage_1.deleteReviewImages)(previousImages);
        }
        /*
         * Recalculate the product's average rating
         * and total review count.
         */
        const statistics = await ProductRating_1.default.aggregate([
            {
                $match: {
                    product: productObjectId
                }
            },
            {
                $group: {
                    _id: '$product',
                    average: {
                        $avg: '$rating'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);
        const average = statistics[0]
            ? Number(statistics[0].average.toFixed(1))
            : 0;
        const count = statistics[0]?.count ?? 0;
        /*
         * Store the latest rating summary
         * inside the Product document.
         */
        const updatedProduct = await Products_1.default.findByIdAndUpdate(productObjectId, {
            $set: {
                'ratings.average': average,
                'ratings.count': count
            }
        }, {
            new: true,
            runValidators: true
        });
        return res.status(200).json({
            success: true,
            message: 'Rating and review submitted successfully',
            data: {
                userRating: savedRating.rating,
                review: savedRating.review,
                images: savedRating.images ?? [],
                ratings: {
                    average: updatedProduct
                        ?.ratings
                        ?.average ??
                        average,
                    count: updatedProduct
                        ?.ratings
                        ?.count ??
                        count
                }
            }
        });
    }
    catch (error) {
        console.error('Rate product error:', error);
        const message = error instanceof Error
            ? error.message
            : 'Unable to submit rating and review';
        return res.status(500).json({
            success: false,
            message
        });
    }
};
exports.rateProduct = rateProduct;
// Get product ratings
// Get logged-in user's rating for a product
// GET /api/products/:id/my-rating
const getMyProductRating = async (req, res) => {
    try {
        const { userId } = (0, express_1.getAuth)(req);
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Please login first'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        const productExists = await Products_1.default.exists({
            _id: id,
            isActive: true
        });
        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const existingRating = await ProductRating_1.default.findOne({
            product: id,
            userId
        }).select('rating review images');
        return res.status(200).json({
            success: true,
            data: {
                rating: existingRating?.rating ?? 0,
                review: existingRating?.review ?? '',
                images: existingRating?.images ?? []
            }
        });
    }
    catch (error) {
        console.error('Get product rating error:', error);
        const message = error instanceof Error
            ? error.message
            : 'Unable to get product rating and review';
        return res.status(500).json({
            success: false,
            message
        });
    }
};
exports.getMyProductRating = getMyProductRating;
// Create a new product
// POST /api/products
const createProduct = async (req, res) => {
    try {
        let images = [];
        // const files = req.files as any[];
        const files = req.files;
        // Handle file uploads
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: 'ecom-app/products' }, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result?.secure_url || '');
                    });
                    uploadStream.end(file.buffer);
                });
            });
            images = await Promise.all(uploadPromises);
        }
        let sizes = req.body.sizes || [];
        if (typeof sizes === 'string') {
            try {
                sizes = JSON.parse(sizes);
            }
            catch {
                sizes = sizes
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s !== '');
            }
        }
        if (!Array.isArray(sizes)) {
            sizes = [sizes];
        }
        if (images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }
        const productData = {
            ...req.body,
            images,
            sizes
        };
        const product = await Products_1.default.create(productData);
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.createProduct = createProduct;
// Update a product
// PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        let images = [];
        const files = req.files;
        // Existing images
        if (req.body.existingImages) {
            if (Array.isArray(req.body.existingImages)) {
                images = [...req.body.existingImages];
            }
            else {
                images = [req.body.existingImages];
            }
        }
        // Upload new images
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: 'ecom-app/products' }, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result?.secure_url || '');
                    });
                    uploadStream.end(file.buffer);
                });
            });
            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }
        const updates = { ...req.body };
        // Handle sizes
        if (req.body.sizes) {
            let sizes = req.body.sizes;
            if (typeof sizes === 'string') {
                try {
                    sizes = JSON.parse(sizes);
                }
                catch {
                    sizes = sizes
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s !== '');
                }
            }
            if (!Array.isArray(sizes)) {
                sizes = [sizes];
            }
            updates.sizes = sizes;
        }
        // Update images if provided
        if (req.body.existingImages ||
            (files && files.length > 0)) {
            updates.images = images;
        }
        delete updates.existingImages;
        const product = await Products_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.updateProduct = updateProduct;
// Delete a product
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Products_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map((imageUrl) => {
                const publicIdMatch = imageUrl.match(/\/([^\/]+)\.[a-zA-Z]+$/);
                const publicId = publicIdMatch ? publicIdMatch[1] : null;
                if (publicId) {
                    return cloudinary_1.default.uploader.destroy(publicId);
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        }
        await Products_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.deleteProduct = deleteProduct;
// controller to upload csv file
const importProductsCSV = async (req, res) => {
    try {
        const products = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => {
            console.log(row);
            products.push({
                sku: row["Model/SKU"] || "",
                name: row["Title"] || "Unnamed Product",
                title: row["Title"] || "",
                description: row["Product Description"] || "",
                price: Number(row["Variant Price"]) || 0,
                comparePrice: Number(row["Compare At Price"]) || 0,
                images: row["Image Src"]
                    ? [row["Image Src"]]
                    : [],
                sizes: row["Size"]
                    ? row["Size"].split(",").map((s) => s.trim())
                    : [],
                category: row["Category"] || "Other",
                stock: Number(row["Stock"]) || 0,
                specifications: {},
                highlights: {},
                ratings: {
                    average: 0,
                    count: 0
                },
                isFeatured: false,
                isActive: row["Status"] === "active"
            });
        })
            .on("end", async () => {
            await Products_1.default.insertMany(products);
            res.status(200).json({
                success: true,
                count: products.length
            });
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "CSV import failed"
        });
    }
};
exports.importProductsCSV = importProductsCSV;
// api to handle xlsx and csv file
const importProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx_1.default.utils.sheet_to_json(sheet);
        const products = rows.map((row) => ({
            sku: row["Model/SKU"] || "",
            name: row["Title"] || "Unnamed Product",
            title: row["Title"] || "",
            description: row["Product Description"] || "",
            category: row["Category"] || "Other",
            price: Number(row["Price"]) || 0,
            comparePrice: Number(row["Compare Price"]) || 0,
            stock: Number(row["Stock"]) || 0,
            images: row["Image Src"]
                ? [row["Image Src"]]
                : [],
            sizes: row["Size"]
                ? row["Size"].split(",").map((s) => s.trim())
                : [],
            specifications: {},
            highlights: {},
            ratings: {
                average: 0,
                count: 0
            },
            isFeatured: false,
            isActive: true
        }));
        const result = await Products_1.default.insertMany(products);
        return res.status(200).json({
            success: true,
            inserted: result.length
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Import failed"
        });
    }
};
exports.importProducts = importProducts;
