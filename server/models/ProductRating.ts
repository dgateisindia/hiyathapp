import mongoose, {
    Schema,
    Types
} from 'mongoose'

export interface IProductRating {
    product: Types.ObjectId
    userId: string
    rating: number
    review: string
    createdAt?: Date
    updatedAt?: Date
}

const productRatingSchema =
    new Schema<IProductRating>(
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            userId: {
                type: String,
                required: true,
                trim: true
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },

            review: {
                type: String,
                trim: true,
                default: '',
                maxlength: 1000
            }
        },
        {
            timestamps: true
        }
    )

// One user can submit only one rating/review
// for each product.
// Submitting again updates the existing record.
productRatingSchema.index(
    {
        product: 1,
        userId: 1
    },
    {
        unique: true
    }
)

export default mongoose.model<IProductRating>(
    'ProductRating',
    productRatingSchema
)