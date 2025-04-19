import mongoose from 'mongoose';

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate product data
 * @param {Object} data - Product data to validate
 * @returns {Object} Object with isValid flag and errors array
 */
export const validateProduct = (data) => {
  const errors = [];
  
  // Check required fields
  if (!data.name) errors.push('Product name is required');
  if (data.price === undefined || data.price === null) errors.push('Product price is required');
  if (!data.category) errors.push('Product category is required');
  
  // Validate data types
  if (typeof data.name !== 'string') errors.push('Product name must be a string');
  if (typeof data.price !== 'number') errors.push('Product price must be a number');
  if (typeof data.category !== 'string') errors.push('Product category must be a string');
  if (data.inStock !== undefined && typeof data.inStock !== 'boolean') {
    errors.push('inStock must be a boolean');
  }
  
  // Validate data constraints
  if (data.price < 0) errors.push('Product price cannot be negative');
  if (data.name && data.name.length > 100) {
    errors.push('Product name cannot exceed 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};