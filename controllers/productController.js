import Product from '../models/Product.js';
import { invalidateCache } from '../middleware/cacheMiddleware.js';

/**
 * Get all products
 * @route GET /products
 */
export const getAllProducts = async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { category, inStock, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (minPrice !== undefined) filter.price = { $gte: Number(minPrice) };
    if (maxPrice !== undefined) {
      filter.price = { ...filter.price, $lte: Number(maxPrice) };
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Get a single product by ID
 * @route GET /products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

/**
 * Create a new product
 * @route POST /products
 */
export const createProduct = async (req, res) => {
  try {
    // Create new product from request body
    const product = new Product(req.body);
    
    // Save to database
    await product.save();
    
    // Invalidate cache for products list
    await invalidateCache('api:/products*');
    
    // Return created product with 201 status
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: messages 
      });
    }
    
    res.status(400).json({ message: 'Failed to create product' });
  }
};

/**
 * Update a product by ID
 * @route PUT /products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Invalidate cache for both the specific product and products list
    await invalidateCache(`api:/products/${req.params.id}`);
    await invalidateCache('api:/products*');
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: messages 
      });
    }
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    res.status(400).json({ message: 'Failed to update product' });
  }
};

/**
 * Delete a product by ID
 * @route DELETE /products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Invalidate cache for both the specific product and products list
    await invalidateCache(`api:/products/${req.params.id}`);
    await invalidateCache('api:/products*');
    
    res.json({ 
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

/**
 * Get products by category
 * @route GET /products/category/:category
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({ message: 'Failed to fetch products by category' });
  }
};