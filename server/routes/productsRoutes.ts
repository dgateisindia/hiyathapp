import express from 'express';
import { getProducts, getProduct, updateProduct, deleteProduct, importProductsCSV, importProducts, searchProducts, rateProduct, getMyProductRating } from '../controllers/productController';
import { createProduct } from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';
import upload from '../middleware/upload';
import multer from "multer";


const ProductRouter = express.Router();

// To upload csv file
const csvUpload = multer({
    dest: "uploads/"
});

// Get all products
ProductRouter.get('/', getProducts);

// Search products
ProductRouter.get("/search", searchProducts);

// Rate product
ProductRouter.post(
    '/:id/rating',
    rateProduct
)

ProductRouter.get(
    '/:id/my-rating',
    getMyProductRating
)

// Get single product
ProductRouter.get('/:id', getProduct);

// Create product (admin only)
ProductRouter.post('/', upload.array('images', 5), protect, authorize('admin'), createProduct);

// Update product (admin only) 
ProductRouter.put('/:id', upload.array('images', 5), protect, authorize('admin'), updateProduct);

// Delete product (admin only) 
ProductRouter.delete('/:id', protect, authorize('admin'), deleteProduct);

ProductRouter.post(
    "/import-csv",
    csvUpload.single("file"),
    importProductsCSV
);

ProductRouter.post(
    "/import",
    csvUpload.single("file"),
    importProducts
);

export default ProductRouter;