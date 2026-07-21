"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrder = exports.updateOrderStatus = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const order_1 = __importDefault(require("../models/order"));
const Products_1 = __importDefault(require("../models/Products"));
const Cart_1 = __importDefault(require("../models/Cart"));
// GET user orders
// GET /api/orders
const getOrders = async (req, res) => {
    try {
        const query = { user: req.user._id };
        const orders = await order_1.default.find(query).populate('items.product', 'name images ').sort('-createdAt');
        res.json({ success: true, data: orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrders = getOrders;
// GET single order
// GET /api/orders/:id
const getOrder = async (req, res) => {
    try {
        const order = await order_1.default.findById(req.params.id).populate('items.product', 'name images ');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getOrder = getOrder;
// Create order from cart
// POST /api/orders
const createOrder = async (req, res) => {
    try {
        const { shippingAddress, note } = req.body;
        const cart = await Cart_1.default.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        // verify stock and prepare order items
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Products_1.default.findById(item.product._id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}`
                });
            }
            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
            });
            // reduce stock
            product.stock -= item.quantity;
            await product.save();
        }
        const subtotal = cart.totalAmount;
        const shippingCost = 2;
        const tax = 0;
        const totalAmount = subtotal + shippingCost + tax;
        const order = await order_1.default.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: req.body.paymentMethod || "cash",
            paymentStatus: "pending",
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes: note,
            paymentIntentId: req.body.paymentIntentId,
            orderNumber: "ORD-" + Date.now(),
        });
        if (req.body.paymentMethod !== "stripe") {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
        }
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({
            success: false, message: error.message
        });
    }
};
exports.createOrder = createOrder;
// Update order status
// PUT /api/order/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (orderStatus)
            order.orderStatus = orderStatus;
        if (paymentStatus)
            order.paymentStatus = paymentStatus;
        if (orderStatus === 'delivered')
            order.deliveredAt = new Date();
        await order.save();
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Get all orders
// GET /api/order/admin/all
const getAllOrder = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status)
            query.orderStatus = status;
        const total = await order_1.default.countDocuments(query);
        const orders = await order_1.default.find(query).populate('user', 'name email').populate('items.product', 'name').sort("-createdAt").skip((Number(page) - 1) * Number(limit));
        res.json({
            success: true,
            data: orders,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllOrder = getAllOrder;
