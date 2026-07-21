import {
    NextFunction,
    Request,
    Response
} from 'express'

import multer from 'multer'

const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
]

const multerUpload = multer({
    /*
     * Keep the image temporarily as a Buffer.
     * It will then be sent to Cloudinary.
     */
    storage: multer.memoryStorage(),

    limits: {
        /*
         * Maximum five images.
         */
        files: 5,

        /*
         * Maximum size for each image: 5 MB.
         */
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (
        _req,
        file,
        callback
    ) => {
        if (
            !allowedImageTypes.includes(
                file.mimetype
            )
        ) {
            return callback(
                new Error(
                    'Only JPG, JPEG, PNG and WEBP images are allowed'
                )
            )
        }

        callback(null, true)
    }
})

export const uploadReviewImages = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    multerUpload.array(
        'images',
        5
    )(req, res, error => {
        if (!error) {
            return next()
        }

        if (
            error instanceof
            multer.MulterError
        ) {
            if (
                error.code ===
                'LIMIT_FILE_SIZE'
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            'Each image must be smaller than 5 MB'
                    })
            }

            if (
                error.code ===
                'LIMIT_FILE_COUNT' ||
                error.code ===
                'LIMIT_UNEXPECTED_FILE'
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            'Maximum 5 review images are allowed'
                    })
            }

            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(400).json({
            success: false,

            message:
                error instanceof Error
                    ? error.message
                    : 'Invalid image upload'
        })
    })
}