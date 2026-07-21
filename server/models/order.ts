import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
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
})

const orderSchema = new mongoose.Schema<IOrder>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

}

    , { timestamps: true });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;