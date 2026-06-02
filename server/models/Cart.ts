import mongoose, { Schema, Document } from 'mongoose';
import { ICart, ICartItem } from '../types';

const cartItemSchema = new Schema<ICartItem>({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String
    }
});

const cartSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

cartSchema.methods.calculateTotal = function (this: ICart) {
    this.totalAmount = this.items.reduce((total: number, item: ICartItem) => {
        return total + (item.price * item.quantity);
    }, 0);
    return this.totalAmount;
};

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;