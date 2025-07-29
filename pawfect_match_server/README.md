# Pawfect Match Server

A Node.js Express server for the Pawfect Match pet adoption platform.

## Project Structure

```
/server
│
├── config/
│   ├── db.js          # MongoDB connection configuration
│   └── firebase.js    # Firebase admin configuration
│
├── middlewares/
│   ├── authMiddleware.js  # Firebase token verification
│   └── verifyAdmin.js     # Admin role verification
│
├── controllers/
│   ├── userController.js
│   ├── petController.js
│   ├── adoptionController.js
│   ├── favoriteController.js
│   ├── adoptionRequestController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── couponController.js
│   └── cartController.js
│
├── routes/
│   ├── userRoutes.js
│   ├── petRoutes.js
│   ├── adoptionRoutes.js
│   ├── favoriteRoutes.js
│   ├── adoptionRequestRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── couponRoutes.js
│   └── cartRoutes.js
│
├── utils/
│   └── uuid.js
│
└── server.js          # Main server file
```

## API Endpoints

### Users
- `GET /users` - Get users with optional filtering
- `POST /users` - Create new user
- `PATCH /users/:email` - Update user by email

### Pets
- `GET /pets` - Get pets by owner email
- `GET /pets/:id` - Get pet by ID
- `POST /pets` - Create new pet
- `PATCH /pets/:id` - Update pet info
- `PATCH /pets/:id/adoption` - Update pet adoption status
- `PATCH /pets/:id/transfer` - Transfer pet ownership

### Adoption Posts
- `GET /adoption-posts` - Get adoption posts with filtering
- `POST /adoptionPosts` - Create adoption post

### Favorites
- `GET /favorites/:userId` - Get favorites by user ID
- `POST /favorites` - Add to favorites
- `DELETE /favorites` - Remove from favorites

### Adoption Requests
- `GET /adoption-requests/:email` - Get adoption requests by owner email
- `GET /my-adoption-requests/:email` - Get adoption requests by requester email
- `POST /adoption-requests` - Create adoption request
- `PATCH /adoption-requests/:id/status` - Update adoption request status

### Products
- `GET /products` - Get products with filtering and sorting
- `POST /products` - Create new product

### Orders
- `GET /orders` - Get paid orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PATCH /orders/paid/:id` - Mark order as paid
- `PATCH /orders/:id` - Update delivery status

### Cart
- `GET /cart` - Get cart items (unpaid orders)
- `DELETE /cart/:orderId` - Remove item from cart
- `PATCH /cart/:orderId` - Update cart item

### Coupons
- `GET /validate-coupon/:code` - Validate coupon by code
- `GET /coupons` - Get all coupons
- `POST /coupons` - Create new coupon
- `PATCH /coupons/:id` - Update coupon expire date
- `GET /coupons/:code` - Legacy coupon validation

### Payment
- `POST /create-payment-intent` - Create Stripe payment intent

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
FB_SERVICE_KEY=your_firebase_service_key_base64
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
```

## Features

- **User Management**: Firebase authentication with user profiles
- **Pet Management**: CRUD operations for pets with adoption status
- **Adoption System**: Post pets for adoption and manage requests
- **Favorites**: Save and manage favorite adoption posts
- **E-commerce**: Product catalog with shopping cart and orders
- **Payment Integration**: Stripe payment processing
- **Coupon System**: Discount codes with expiration dates
- **Admin Features**: Role-based access control for administrators

## Database Collections

- `users` - User profiles and authentication data
- `pets` - Pet information and adoption status
- `adoption-posts` - Adoption listings
- `adoption-requests` - Adoption applications
- `favourites` - User favorite posts
- `products` - E-commerce product catalog
- `orders` - Purchase orders and payment status
- `coupons` - Discount codes and validation 