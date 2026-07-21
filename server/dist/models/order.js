"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    size: { type: String },
});
const orderSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cash', 'stripe'], required: true, default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], required: true, default: 'pending' },
    paymentIntentId: { type: String },
    orderStatus: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], required: true, default: 'placed' },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    deliveredAt: { type: Date }
}, { timestamps: true });
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
