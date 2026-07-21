"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, trim: true },
    email: { type: String, unique: true, trim: true },
    clerkId: { type: String, unique: true, sparse: true },
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
