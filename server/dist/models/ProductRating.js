"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewImageSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    }
}, {
    _id: false
});
const productRatingSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 1000
    },
    images: {
        type: [reviewImageSchema],
        default: [],
        validate: {
            validator: (images) => images.length <= 5,
            message: 'Maximum 5 review images are allowed'
        }
    }
}, {
    timestamps: true
});
/*
 * One user can add only one rating/review
 * for the same product.
 */
productRatingSchema.index({
    product: 1,
    userId: 1
}, {
    unique: true
});
const ProductRating = (0, mongoose_1.model)('ProductRating', productRatingSchema);
exports.default = ProductRating;
