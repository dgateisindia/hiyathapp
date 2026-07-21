"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReviewImages = exports.uploadReviewImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadReviewImage = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: 'hiyath/product-reviews',
            resource_type: 'image'
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result) {
                return reject(new Error('Image upload failed'));
            }
            resolve({
                url: result.secure_url,
                publicId: result.public_id
            });
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadReviewImage = uploadReviewImage;
const deleteReviewImages = async (images) => {
    await Promise.allSettled(images.map(image => cloudinary_1.default.uploader.destroy(image.publicId, {
        resource_type: 'image'
    })));
};
exports.deleteReviewImages = deleteReviewImages;
