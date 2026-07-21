import express from 'express';
import { createOrder, getAllOrder, getOrder, getOrders, updateOrderStatus } from '../controllers/orderController';
import { authorize, protect } from '../middleware/auth';

const OrderRouter = express.Router()

// Get user orders
OrderRouter.get('/', protect, getOrders)

// Get single order
OrderRouter.get('/:id', protect, getOrder)

// Create order from cart
OrderRouter.post('/', protect, createOrder)

// Update order status (admin only)
OrderRouter.put('/:id/status', protect, authorize('admin'), updateOrderStatus)

// Get all orders (admin only)
OrderRouter.get('/admin/all', protect, authorize('admin'), getAllOrder)

export default OrderRouter;
