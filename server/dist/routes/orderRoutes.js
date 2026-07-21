"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const OrderRouter = express_1.default.Router();
// Get user orders
OrderRouter.get('/', auth_1.protect, orderController_1.getOrders);
// Get single order
OrderRouter.get('/:id', auth_1.protect, orderController_1.getOrder);
// Create order from cart
OrderRouter.post('/', auth_1.protect, orderController_1.createOrder);
// Update order status (admin only)
OrderRouter.put('/:id/status', auth_1.protect, (0, auth_1.authorize)('admin'), orderController_1.updateOrderStatus);
// Get all orders (admin only)
OrderRouter.get('/admin/all', auth_1.protect, (0, auth_1.authorize)('admin'), orderController_1.getAllOrder);
exports.default = OrderRouter;
