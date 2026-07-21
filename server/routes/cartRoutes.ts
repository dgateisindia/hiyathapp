import express from 'express';
import { protect } from '../middleware/auth';
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from '../controllers/cartController';

const CartRouter = express.Router();

// GET user cart
CartRouter.get('/', protect, getCart);

// Add item to cart
CartRouter.post('/add', protect, addToCart);

// Update item in cart
CartRouter.put('/item/:productId', protect, updateCartItem);

// Remove item from cart
CartRouter.delete('/item/:productId', protect, removeCartItem);

// Clear cart
CartRouter.delete('/', protect, clearCart);

export default CartRouter;