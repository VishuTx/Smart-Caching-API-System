# Smart Caching API System

A RESTful API built with Node.js, Express, MongoDB, and Redis for intelligent caching.

## Features

- Read-through caching for improved performance
- Automatic cache invalidation for data consistency
- RESTful API for product management
- MongoDB for data persistence
- Redis for caching

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/smart-caching-api
REDIS_URL=redis://localhost:6379
```

## Running the application

For development (with hot reloading):

```bash
npm run dev
```

For production:

```bash
npm start
```

## API Endpoints

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get a product by ID
- `GET /products/category/:category` - Get products by category
- `POST /products` - Create a new product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Example Requests

Creating a product:

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone X",
    "price": 999.99,
    "category": "Electronics",
    "inStock": true
  }'
```

## Caching System

The API uses Redis to cache responses from GET requests. The caching system works as follows:

1. When a GET request is received, the system checks if the response is in the cache
2. If the response is in the cache, it is returned immediately
3. If not, the request is processed, and the response is cached before being returned
4. When data is modified (POST, PUT, DELETE), relevant cache entries are invalidated

## License

MIT