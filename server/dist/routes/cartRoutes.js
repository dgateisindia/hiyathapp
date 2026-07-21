"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cartController_1 = require("../controllers/cartController");
const CartRouter = express_1.default.Router();
// GET user cart
CartRouter.get('/', auth_1.protect, cartController_1.getCart);
// Add item to cart
CartRouter.post('/add', auth_1.protect, cartController_1.addToCart);
// Update item in cart
CartRouter.put('/item/:productId', auth_1.protect, cartController_1.updateCartItem);
// Remove item from cart
CartRouter.delete('/item/:productId', auth_1.protect, cartController_1.removeCartItem);
// Clear cart
CartRouter.delete('/', auth_1.protect, cartController_1.clearCart);
exports.default = CartRouter;
