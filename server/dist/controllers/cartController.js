"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const Products_1 = __importDefault(require("../models/Products"));
// get user cart
// GET /api/cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart_1.default.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
        if (!cart) {
            cart = await Cart_1.default.create({ user: req.user._id, items: [] });
        }
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCart = getCart;
// Add item to cart
// POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size } = req.body;
        const product = await Products_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        let cart = await Cart_1.default.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart_1.default({ user: req.user._id, items: [] });
        }
        // find item with same product and size
        const existingItem = cart.items.find((item) => {
            return item.product.toString() === productId && item.size === size;
        });
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = product.price;
        }
        else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                size,
            });
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate('items.product', 'name images price stock');
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToCart = addToCart;
// Update item in cart
// PUT /api/cart/item/:productId
const updateCartItem = async (req, res) => {
    try {
        const { quantity, size } = req.body;
        const { productId } = req.params;
        const cart = await Cart_1.default.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const normalizedSize = size || null;
        const item = cart.items.find((item) => item.product.toString() === productId &&
            (item.size || null) === normalizedSize);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        if (quantity <= 0) {
            cart.items = cart.items.filter((item) => !(item.product.toString() === productId && item.size === size));
        }
        else {
            const product = await Products_1.default.findById(productId);
            if (product.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock' });
            }
            item.quantity = quantity;
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate('items.product', 'name images price stock');
        res.json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCartItem = updateCartItem;
// Remove item from cart
// DELETE /api/cart/item/:productId
const removeCartItem = async (req, res) => {
    try {
        const cart = await Cart_1.default.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }
        const normalizedSize = req.query.size || null;
        cart.items = cart.items.filter((item) => {
            // Keep other products
            if (item.product.toString() !== req.params.productId) {
                return true;
            }
            // Remove only the matching product and size
            return (item.size || null) !== normalizedSize;
        });
        cart.calculateTotal();
        await cart.save();
        await cart.populate("items.product", "name images price stock");
        res.json({
            success: true,
            data: cart,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.removeCartItem = removeCartItem;
// Clear cart
// DELETE /api/cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart_1.default.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
        }
        res.json({
            success: true,
            message: 'Cart cleared'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.clearCart = clearCart;
