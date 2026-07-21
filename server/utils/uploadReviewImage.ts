import cloudinary from '../config/cloudinary'

export interface ReviewImageResult {
    url: string
    publicId: string
}

export const uploadReviewImage = (
    fileBuffer: Buffer
): Promise<ReviewImageResult> => {
    return new Promise(
        (resolve, reject) => {
            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder:
                            'hiyath/product-reviews',

                        resource_type:
                            'image'
                    },

                    (error, result) => {
                        if (error) {
                            return reject(
                                error
                            )
                        }

                        if (!result) {
                            return reject(
                                new Error(
                                    'Image upload failed'
                                )
                            )
                        }

                        resolve({
                            url:
                                result.secure_url,

                            publicId:
                                result.public_id
                        })
                    }
                )

            uploadStream.end(
                fileBuffer
            )
        }
    )
}

export const deleteReviewImages =
    async (
        images: ReviewImageResult[]
    ): Promise<void> => {
        await Promise.allSettled(
            images.map(image =>
                cloudinary.uploader.destroy(
                    image.publicId,
                    {
                        resource_type:
                            'image'
                    }
                )
            )
        )
    }