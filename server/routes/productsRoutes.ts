import express from 'express';
import { getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { createProduct } from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';
import upload from '../middleware/upload';


const ProductRouter = express.Router();

// Get all products
ProductRouter.get('/', getProducts);

// Get single product
ProductRouter.get('/:id', getProduct);

// Create product (admin only)
ProductRouter.post('/', upload.array('images', 5), protect, authorize('admin'), createProduct);

// Update product (admin only) 
ProductRouter.put('/:id', upload.array('images', 5), protect, authorize('admin'), updateProduct);

// Delete product (admin only) 
ProductRouter.delete('/:id', protect, authorize('admin'), deleteProduct);

export default ProductRouter;