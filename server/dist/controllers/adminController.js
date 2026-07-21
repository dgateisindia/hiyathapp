"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const user_1 = __importDefault(require("../models/user"));
const Products_1 = __importDefault(require("../models/Products"));
const order_1 = __importDefault(require("../models/order"));
// GET dashboard stats
// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await user_1.default.countDocuments();
        const totalProducts = await Products_1.default.countDocuments();
        const totalOrders = await order_1.default.countDocuments();
        const validOrders = await order_1.default.find({ orderStatus: { $ne: 'cancelled' } });
        const totalRevenue = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const recentOrders = await order_1.default.find().sort('-createdAt').limit(5).populate('user', 'name email');
        res.json({
            success: true,
            data: {
                totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
