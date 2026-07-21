"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const Products_1 = __importDefault(require("../models/Products"));
// Get Wishlist
// GET /api/wishlist
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist_1.default.findOne({
            user: req.user._id,
        }).populate("products");
        if (!wishlist) {
            wishlist = await Wishlist_1.default.create({
                user: req.user._id,
                products: [],
            });
        }
        res.json({
            success: true,
            data: wishlist,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getWishlist = getWishlist;
// Add Product To Wishlist
// POST /api/wishlist/add
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Products_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        let wishlist = await Wishlist_1.default.findOne({
            user: req.user._id,
        });
        if (!wishlist) {
            wishlist = new Wishlist_1.default({
                user: req.user._id,
                products: [],
            });
        }
        const exists = wishlist.products.some((id) => id.toString() === productId);
        if (!exists) {
            wishlist.products.push(productId);
        }
        await wishlist.save();
        await wishlist.populate("products");
        res.json({
            success: true,
            data: wishlist,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.addToWishlist = addToWishlist;
// Remove Product From Wishlist
// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist_1.default.findOne({
            user: req.user._id,
        });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found",
            });
        }
        wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
        await wishlist.save();
        await wishlist.populate("products");
        res.json({
            success: true,
            data: wishlist,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.removeFromWishlist = removeFromWishlist;
// Clear Wishlist
// DELETE /api/wishlist
const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist_1.default.findOne({
            user: req.user._id,
        });
        if (wishlist) {
            wishlist.products = [];
            await wishlist.save();
        }
        res.json({
            success: true,
            message: "Wishlist cleared",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.clearWishlist = clearWishlist;
