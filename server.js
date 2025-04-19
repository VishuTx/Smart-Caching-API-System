import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import { initRedis } from './config/redis.js';

// Load environment variables
dotenv.config();

// Initialize Redis connection (but don't wait for it)
initRedis().catch(err => {
  console.log('Redis initialization failed, continuing without caching:', err.message);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/products', productRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Caching API System',
    endpoints: {
      products: '/products'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Connect to MongoDB and start server, with fallback
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startServer();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
    console.log('🔶 Starting server without database connection...');
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}