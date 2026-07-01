import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            unique: true,
            sparse: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        title: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            default: 0
        },

        comparePrice: {
            type: Number,
            default: 0
        },

        stock: {
            type: Number,
            default: 0
        },

        images: {
            type: [String],
            default: []
        },

        sizes: {
            type: [String],
            default: []
        },

        specifications: {
            type: Map,
            of: String,
            default: {}
        },

        highlights: {
            type: Map,
            of: String,
            default: {}
        },

        ratings: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Product", productSchema);