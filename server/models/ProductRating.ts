import mongoose, {
    Document,
    Schema,
    model
} from 'mongoose'



interface IReviewImage {
    url: string
    publicId: string
}

interface IProductRating extends Document {
    userId: string
    product: mongoose.Types.ObjectId
    rating: number
    review: string
    images: IReviewImage[]
    createdAt: Date
    updatedAt: Date
}

const reviewImageSchema =
    new Schema<IReviewImage>(
        {
            url: {
                type: String,
                required: true
            },

            publicId: {
                type: String,
                required: true
            }
        },
        {
            _id: false
        }
    )

const productRatingSchema =
    new Schema<IProductRating>(
        {
            userId: {
                type: String,
                required: true,
                index: true
            },

            product: {
                type: Schema.Types.ObjectId,
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
                    validator: (
                        images: IReviewImage[]
                    ) => images.length <= 5,

                    message:
                        'Maximum 5 review images are allowed'
                }
            }
        },
        {
            timestamps: true
        }
    )

/*
 * One user can add only one rating/review
 * for the same product.
 */
productRatingSchema.index(
    {
        product: 1,
        userId: 1
    },
    {
        unique: true
    }
)

const ProductRating =
    model<IProductRating>(
        'ProductRating',
        productRatingSchema
    )

export default ProductRating