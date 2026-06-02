import mongoose, { Schema, model } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    sizes: [{ type: String }],
    category: { type: String, required: true, enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"] as const, default: "Other" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },


}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;