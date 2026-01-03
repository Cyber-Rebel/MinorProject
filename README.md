# 🛒 Mino E-Commerce Platform

A full-featured, microservices-based e-commerce platform built with Node.js, React, and MongoDB. The platform supports both customer and seller experiences with real-time AI-powered shopping assistance.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-v19-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-v8-green?style=flat-square&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Cache-red?style=flat-square&logo=redis)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Message%20Broker-orange?style=flat-square&logo=rabbitmq)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=flat-square&logo=docker)

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
- [Features](#-features)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Project Structure](#-project-structure)

## 🎯 Overview

Mino is a modern e-commerce platform designed with a microservices architecture. It provides:

- **Customer Portal**: Browse products, manage cart, place orders, and chat with AI assistant
- **Seller Dashboard**: Manage products, track orders, view analytics
- **Real-time Notifications**: Email notifications for user registration and product listings
- **AI Shopping Assistant**: Powered by Google Gemini AI with LangChain integration

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend Applications                           │
│  ┌─────────────────────────────┐     ┌─────────────────────────────────┐    │
│  │    Frontend User (5173)     │     │    Frontend Seller (5174)       │    │
│  │    React + Vite + Redux     │     │    React + Vite + Redux         │    │
│  └─────────────────────────────┘     └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend Microservices                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │  Auth   │ │ Product │ │  Cart   │ │  Order  │ │ Seller  │ │ AI Buddy │  │
│  │ :3000   │ │ :3001   │ │ :3002   │ │ :3003   │ │ :3007   │ │  :3005   │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘  │
│       │           │           │           │           │           │         │
│       └───────────┴───────────┴─────┬─────┴───────────┴───────────┘         │
│                                     │                                        │
│                          ┌──────────▼──────────┐                            │
│                          │      RabbitMQ       │                            │
│                          │   Message Broker    │                            │
│                          │      :5672          │                            │
│                          └──────────┬──────────┘                            │
│                                     │                                        │
│                          ┌──────────▼──────────┐                            │
│                          │    Notification     │                            │
│                          │      :3006          │                            │
│                          └─────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Layer                                      │
│  ┌─────────────────────────────┐     ┌─────────────────────────────────┐    │
│  │        MongoDB :27017       │     │        Redis :6379              │    │
│  │    (Primary Database)       │     │    (Session/Cache Store)        │    │
│  └─────────────────────────────┘     └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Message Queue Architecture

Services communicate asynchronously via RabbitMQ:

| Queue Name | Publisher | Consumer | Purpose |
|------------|-----------|----------|---------|
| `Auth_Notification.USER_CREATED` | Auth | Notification | Welcome emails |
| `AUTH_SELLER_DASHBOARD.USER_CREATED` | Auth | Seller Dashboard | Sync user data |
| `PRODUCT_CREATED` | Product | Seller Dashboard | Sync product data |
| `Product_Notification.PRODUCT_CREATED` | Product | Notification | Product live emails |
| `ORDER_SELLER_DASHBOARD.ORDER_CREATED` | Order | Seller Dashboard | Sync order data |

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Redis (ioredis)** | Caching & session management |
| **RabbitMQ (amqplib)** | Message broker |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email notifications |
| **LangChain + Google Gemini** | AI shopping assistant |
| **Socket.io** | Real-time communication |
| **ImageKit** | Image storage & CDN |
| **Multer** | File uploads |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 7** | Build tool |
| **Redux Toolkit** | State management |
| **React Router 7** | Routing |
| **Tailwind CSS 4** | Styling |
| **Axios** | HTTP client |
| **Socket.io Client** | Real-time communication |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Jest** | Testing framework |
| **Supertest** | API testing |
| **MongoDB Memory Server** | In-memory DB for tests |

## 📦 Services

### 1. Auth Service (Port 3000)
User authentication and authorization service.

**Features:**
- User registration with role support (user/seller)
- Login with JWT token (httpOnly cookies)
- Session management
- Address management (CRUD)
- Redis-based token blacklisting

### 2. Product Service (Port 3001)
Product catalog management.

**Features:**
- Create products with image upload (ImageKit CDN)
- Full-text search on title and description
- Price range filtering
- Pagination support
- Seller-specific product management

### 3. Cart Service (Port 3002)
Shopping cart management.

**Features:**
- Add items to cart
- Update item quantities
- Get cart contents
- Per-user cart isolation

### 4. Order Service (Port 3003/3004)
Order processing and management.

**Features:**
- Create orders from cart
- Order status management (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- Order cancellation
- Shipping address management
- Pagination support

### 5. Notification Service (Port 3006)
Email notification service.

**Features:**
- Welcome emails on registration
- Product listing confirmation emails
- Gmail OAuth2 integration
- Queue-based message processing

### 6. Seller Dashboard (Port 3007)
Seller analytics and order management.

**Features:**
- Dashboard metrics (products, orders, revenue)
- Order management with status updates
- Product listing view
- Synced data via message queues

### 7. AI Buddy (Port 3005)
AI-powered shopping assistant.

**Features:**
- Real-time chat via WebSocket
- Product search capability
- Add to cart functionality
- Powered by Google Gemini 2.0 Flash
- LangGraph agent architecture

## ✨ Features

### Customer Features
- 🔐 Secure authentication with JWT
- 🛍️ Browse and search products
- 🛒 Shopping cart management
- 📦 Order placement and tracking
- 📍 Multiple shipping addresses
- 🤖 AI shopping assistant
- 📱 Responsive design

### Seller Features
- 📊 Sales dashboard with metrics
- 📦 Product management (CRUD)
- 🖼️ Image upload with CDN
- 📋 Order management
- 🚚 Order status updates
- 📈 Analytics overview

### Platform Features
- 🏗️ Microservices architecture
- 📨 Async messaging with RabbitMQ
- 🗄️ MongoDB with text indexing
- ⚡ Redis caching
- 🐳 Docker containerization
- 🧪 Automated testing

## 📡 API Reference

### Auth Service (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/me` | Get current user | ✅ |
| GET | `/logout` | Logout user | ❌ |
| GET | `/users/me/addresses` | Get user addresses | ✅ |
| POST | `/users/me/addresses` | Add address | ✅ |
| DELETE | `/users/me/addresses/:id` | Delete address | ✅ |

### Product Service (`/api/products`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List products (with filters) | ❌ |
| GET | `/:id` | Get product by ID | ❌ |
| POST | `/` | Create product | ✅ (seller/admin) |
| PATCH | `/:id` | Update product | ✅ (seller) |
| DELETE | `/:id` | Delete product | ✅ (seller) |
| GET | `/seller` | Get seller's products | ✅ (seller) |

**Query Parameters:**
- `q` - Search query (full-text search)
- `miniprice` - Minimum price filter
- `maxprice` - Maximum price filter
- `skip` - Pagination offset
- `limit` - Results limit (max 20)

### Cart Service (`/api/carts`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's cart | ✅ |
| POST | `/items` | Add item to cart | ✅ |
| PATCH | `/items/:productId` | Update item quantity | ✅ |

### Order Service (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create order from cart | ✅ |
| GET | `/me` | Get user's orders | ✅ (admin) |
| GET | `/:id` | Get order by ID | ✅ |
| POST | `/:id/cancel` | Cancel order | ✅ |
| PATCH | `/:id/address` | Update order address | ✅ |

### Seller Dashboard (`/api/seller/dashbord`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/matrics` | Get dashboard metrics | ✅ (seller) |
| GET | `/orders` | Get seller's orders | ✅ (seller) |
| GET | `/orders/:orderId` | Get order details | ✅ (seller) |
| PATCH | `/orders/:orderId/status` | Update order status | ✅ (seller) |
| GET | `/products` | Get seller's products | ✅ (seller) |

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- MongoDB v8+
- Redis
- RabbitMQ
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Mino-Project
```

2. **Install dependencies for all services**
```bash
# Backend services
cd auth && npm install && cd ..
cd product && npm install && cd ..
cd cart && npm install && cd ..
cd order && npm install && cd ..
cd notification && npm install && cd ..
cd seller-dashbord && npm install && cd ..
cd ai-buddy && npm install && cd ..

# Frontend applications
cd frontend-user && npm install && cd ..
cd frontend-seller && npm install && cd ..
```

3. **Set up environment variables**

Create `.env` files in each service directory:

**Auth Service (.env)**
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/mino-auth
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
```

**Product Service (.env)**
```env
PORT=3001
MONGO_URl=mongodb://localhost:27017/mino-products
JWT_SECRET=your-secret-key
RABBITMQ_URL=amqp://localhost:5672
IMAGEKIT_PUBLIC_KEY=your-key
IMAGEKIT_PRIVATE_KEY=your-key
IMAGEKIT_URL_ENDPOINT=your-endpoint
```

**Cart Service (.env)**
```env
PORT=3002
MONGO_URI=mongodb://localhost:27017/mino-cart
JWT_SECRET=your-secret-key
```

**Order Service (.env)**
```env
PORT=3003
MONGO_URI=mongodb://localhost:27017/mino-orders
JWT_SECRET=your-secret-key
RABBITMQ_URL=amqp://localhost:5672
```

**Notification Service (.env)**
```env
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-oauth-client-id
CLIENT_SECRET=your-oauth-client-secret
REFRESH_TOKEN=your-refresh-token
RABBITMQ_URL=amqp://localhost:5672
```

**AI Buddy Service (.env)**
```env
MONGO_URI=mongodb://localhost:27017/mino-ai
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Seller Dashboard (.env)**
```env
MONGO_URI=mongodb://localhost:27017/mino-seller
JWT_SECRET=your-secret-key
RABBITMQ_URL=amqp://localhost:5672
```

4. **Start the services**

```bash
# Start backend services (in separate terminals)
cd auth && npm start
cd product && npm start
cd cart && npm start
cd order && npm start
cd notification && npm start
cd seller-dashbord && npm start
cd ai-buddy && npm start

# Start frontend applications
cd frontend-user && npm run dev
cd frontend-seller && npm run dev
```

5. **Access the applications**
- Customer Portal: http://localhost:5173
- Seller Dashboard: http://localhost:5174
- RabbitMQ Management: http://localhost:15672

## 🐳 Docker Setup

### Quick Start with Docker

1. **Navigate to docker directory**
```bash
cd docker
cp .env.example .env
# Edit .env with your values
```

2. **Build and run all services**
```bash
docker-compose up -d --build
```

3. **View logs**
```bash
docker-compose logs -f
```

4. **Stop all services**
```bash
docker-compose down
```

### Service Ports (Docker)
| Service | Port | Description |
|---------|------|-------------|
| Auth | 3000 | User authentication |
| Product | 3001 | Product management |
| Cart | 3002 | Shopping cart |
| Order | 3003 | Order processing |
| Notification | 3004 | Email notifications |
| Seller Dashboard | 3005 | Seller analytics |
| AI Buddy | 3006 | AI chatbot |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache |
| RabbitMQ | 5672/15672 | Message broker |

### Database Access
```bash
# MongoDB shell
docker exec -it mino-mongodb mongosh -u admin -p password123

# Redis CLI
docker exec -it mino-redis redis-cli
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (data)
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all
```

## 🔐 Environment Variables

### Required for All Services
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |

### RabbitMQ (for async services)
| Variable | Description |
|----------|-------------|
| `RABBITMQ_URL` | RabbitMQ connection URL |

### Redis (Auth service)
| Variable | Description |
|----------|-------------|
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password (optional) |

### Email (Notification service)
| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Gmail address |
| `CLIENT_ID` | OAuth2 client ID |
| `CLIENT_SECRET` | OAuth2 client secret |
| `REFRESH_TOKEN` | OAuth2 refresh token |

### AI (AI Buddy service)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `ALLOWED_ORIGINS` | CORS allowed origins |

### Image Upload (Product service)
| Variable | Description |
|----------|-------------|
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |

## 🧪 Testing

### Running Tests

```bash
# Auth service tests
cd auth
npm test

# Cart service tests
cd cart
npm test

# Product service tests
cd product
npm test
```

### Test Coverage

The project uses:
- **Jest** as the test runner
- **Supertest** for HTTP assertions
- **MongoDB Memory Server** for isolated database testing

### Test Files
```
auth/__tests__/
├── addresses.test.js
├── login.test.js
├── logout.test.js
├── me.test.js
└── register.test.js

cart/src/__tests__/
└── card.controller.addItem.test.js

product/tests/
├── products.delete.test.js
├── products.get.test.js
├── products.id.test.js
├── products.patch.test.js
└── products.test.js
```

## 📁 Project Structure

```
Mino-Project/
├── docker/                     # Docker configurations
│   ├── .env.example
│   ├── auth.Dockerfile
│   ├── cart.Dockerfile
│   ├── order.Dockerfile
│   ├── product.Dockerfile
│   ├── notification.Dockerfile
│   ├── seller-dashboard.Dockerfile
│   └── ai-buddy.Dockerfile
│
├── auth/                       # Auth microservice
│   ├── server.js
│   ├── src/
│   │   ├── index.js
│   │   ├── broker/             # RabbitMQ integration
│   │   ├── controllers/
│   │   ├── db/                 # MongoDB + Redis
│   │   ├── Middlware/
│   │   ├── Models/
│   │   └── router/
│   └── __tests__/
│
├── product/                    # Product microservice
│   ├── server.js
│   ├── src/
│   │   ├── broker/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── Models/
│   │   ├── routes/
│   │   └── serviecs/           # ImageKit upload
│   └── tests/
│
├── cart/                       # Cart microservice
│   ├── server.js
│   ├── src/
│   │   ├── controller/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── model/
│   │   └── routes/
│   └── __tests__/
│
├── order/                      # Order microservice
│   ├── server.js
│   ├── src/
│   │   ├── broker/
│   │   ├── Controller/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── Model/
│   │   └── Routes/
│
├── notification/               # Notification microservice
│   ├── server.js
│   ├── src/
│   │   ├── broker/
│   │   └── email.js
│
├── seller-dashbord/            # Seller Dashboard microservice
│   ├── server.js
│   ├── src/
│   │   ├── broker/
│   │   ├── controller/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── router/
│
├── ai-buddy/                   # AI Assistant microservice
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── agent/              # LangChain agent
│   │   ├── db/
│   │   └── sockets/            # WebSocket server
│
├── frontend-user/              # Customer React app
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/              # Redux store
│
└── frontend-seller/            # Seller React app
    ├── vite.config.js
    ├── src/
    │   ├── App.jsx
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   └── store/              # Redux store
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ by the Mino Team

---

<div align="center">

**[⬆ Back to Top](#-mino-e-commerce-platform)**

</div>
