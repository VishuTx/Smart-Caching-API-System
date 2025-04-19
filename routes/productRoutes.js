import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCategory
} from '../controllers/productController.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * Product Routes
 * All routes are prefixed with /products
 */

// Apply cache middleware to GET routes with different TTLs
router.get('/', cacheMiddleware(60 * 15), getAllProducts); // Cache for 15 minutes
router.get('/category/:category', cacheMiddleware(60 * 10), getProductsByCategory); // Cache for 10 minutes
router.get('/:id', cacheMiddleware(60 * 5), getProductById); // Cache for 5 minutes

// Routes that modify data (no caching, but they invalidate cache)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;