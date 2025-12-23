# MERN Stack Architecture Research: GastroPay

**Research Date**: 2025-12-13
**Sources Consulted**: 30+ authoritative sources
**Focus**: Multi-tenant restaurant ordering system for VPS deployment

---

## Executive Summary

GastroPay should adopt a **modular monolithic architecture** with a single Node.js/Express backend and React frontend, leveraging MongoDB's multi-tenant capabilities via shared collections with `tenantId` filtering. Use Zustand for frontend state management (lightweight, no providers), JWT authentication with refresh tokens, and containerize with Docker for VPS deployment. This balances simplicity for rapid development against scalability needs for multiple restaurant tenants.

---

## Architecture Overview

### Recommended Stack Components

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Backend Runtime** | Node.js | 20+ LTS | Server runtime |
| **API Framework** | Express.js | 4.19+ | RESTful API server |
| **Database** | MongoDB | 6.0+ | Multi-tenant document store |
| **Frontend Framework** | React | 18.3+ | UI/UX client |
| **State Management** | Zustand | 4.5+ | Client-side state |
| **HTTP Client** | TanStack Query | 5.0+ | Server state & caching |
| **Authentication** | JWT + bcrypt | jsonwebtoken 9.0+, bcryptjs 2.4+ | Stateless auth |
| **Validation** | Zod | 3.22+ | Request/response validation |
| **Containerization** | Docker | Latest | VPS deployment |

---

## Detailed Implementation Guidelines

### 1. MongoDB Multi-Tenant Schema

**Approach**: Single database with shared collections + tenantId field filtering
**Rationale**: Cost-effective for many small-medium restaurants; query consistency; simplified maintenance

**Core Collections**:
```javascript
// restaurants collection
{
  _id: ObjectId,
  tenantId: "restaurant-123",           // Multi-tenant isolation
  name: "Restaurant Name",
  address: { street, city, zip, lat, lng },
  phone: String,
  email: String,
  settings: { operatingHours, timezone, currency },
  createdAt: Date,
  updatedAt: Date
}

// menus collection
{
  _id: ObjectId,
  tenantId: "restaurant-123",
  name: "Main Menu",
  categories: [
    {
      id: String,
      name: "Appetizers",
      items: [
        {
          id: String,
          name: "Dish Name",
          price: Number,
          description: String,
          image: String,
          available: Boolean
        }
      ]
    }
  ],
  isActive: Boolean,
  createdAt: Date
}

// orders collection
{
  _id: ObjectId,
  tenantId: "restaurant-123",
  orderId: String,                      // Human-readable order #
  customerId: ObjectId,
  items: [
    { itemId: String, quantity: Number, price: Number, notes: String }
  ],
  totalAmount: Number,
  status: "pending|confirmed|preparing|ready|delivered|cancelled",
  paymentStatus: "unpaid|paid|refunded",
  deliveryAddress: Object,
  specialInstructions: String,
  createdAt: Date,
  estimatedDeliveryTime: Date
}

// users collection
{
  _id: ObjectId,
  tenantId: "restaurant-123",           // Admin users tied to restaurant
  email: String,
  passwordHash: String,                 // bcryptjs hashed
  name: String,
  role: "admin|manager|staff",
  permissions: [String],
  isActive: Boolean,
  createdAt: Date
}
```

**Critical Indexes**:
```javascript
// Always index tenantId + query field
db.orders.createIndex({ tenantId: 1, createdAt: -1 })
db.menus.createIndex({ tenantId: 1, isActive: 1 })
db.users.createIndex({ tenantId: 1, email: 1 }, { unique: true })
```

---

### 2. Express.js API Structure

**Recommended Folder Organization**:
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   ├── env.js             # Environment variables (dotenv)
│   │   └── constants.js       # App constants
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── tenantId.js        # Extract & validate tenantId from header
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimit.js       # Rate limiting (express-rate-limit)
│   │   └── validation.js      # Zod schema validation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── restaurants.routes.js
│   │   ├── menus.routes.js
│   │   ├── orders.routes.js
│   │   └── users.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── orders.controller.js
│   │   └── ...
│   ├── services/
│   │   ├── order.service.js   # Business logic
│   │   ├── auth.service.js
│   │   └── email.service.js   # Notifications
│   ├── models/
│   │   ├── Order.js           # Mongoose schemas
│   │   ├── Restaurant.js
│   │   └── User.js
│   ├── utils/
│   │   ├── jwt.js             # Token generation/validation
│   │   └── errors.js          # Custom error classes
│   └── app.js                 # Express app setup
├── .env.example
├── .env.local                 # Local secrets (git-ignored)
├── server.js                  # Entry point
└── package.json
```

**Minimal Express Setup** (app.js):
```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const tenantMiddleware = require('./middleware/tenantId');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 100                    // 100 requests per window
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Tenant extraction (all routes except auth)
app.use('/api/auth', authRoutes);
app.use('/api', tenantMiddleware, require('./routes/restaurants.routes'));

// Error handling (MUST be last)
app.use(errorHandler);

module.exports = app;
```

---

### 3. React Frontend Architecture

**Recommended Folder Organization**:
```
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── store.js       # Zustand store
│   │   ├── orders/
│   │   ├── menus/
│   │   └── dashboard/
│   ├── shared/
│   │   ├── components/        # Reusable UI
│   │   ├── hooks/             # useAuth, useFetch, etc.
│   │   └── utils/
│   ├── services/
│   │   └── api.js             # Axios/fetch with TanStack Query
│   ├── store/
│   │   ├── auth.store.js      # Zustand auth store
│   │   └── app.store.js       # Global app state
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

**Zustand Store Example** (auth.store.js):
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      tenantId: null,

      login: async (email, password) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        set({ token: data.token, user: data.user, tenantId: data.tenantId });
      },

      logout: () => set({ token: null, user: null, tenantId: null }),
    }),
    { name: 'auth-store' }  // localStorage persistence
  )
);
```

**TanStack Query Setup** (Replace Redux/Context for server state):
```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

const useOrders = (tenantId) => {
  return useQuery({
    queryKey: ['orders', tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/orders`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      return res.json();
    }
  });
};
```

---

### 4. JWT Authentication Flow

**Token Strategy**:
- **Access Token**: Short-lived (15 min), stored in memory or HttpOnly cookie
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly secure cookie

**Backend JWT Utility** (utils/jwt.js):
```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (userId, tenantId) => {
  const accessToken = jwt.sign(
    { userId, tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, tenantId, tokenVersion: 1 },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateTokens, verifyAccessToken };
```

**Auth Middleware** (middleware/auth.js):
```javascript
const { verifyAccessToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

---

### 5. Security Checklist

- [ ] Use `helmet.js` for HTTP header security
- [ ] CORS restricted to `FRONTEND_URL` environment variable
- [ ] Rate limiting: 100 req/15min default
- [ ] Password hashing: bcryptjs (10 rounds minimum)
- [ ] Input validation: Zod for all request bodies
- [ ] Refresh tokens in HttpOnly secure cookies (not localStorage)
- [ ] All sensitive routes protected by JWT + tenantId check
- [ ] HTTPS enforced (VPS with Let's Encrypt)
- [ ] Environment variables: Never commit `.env` (use `.env.example`)
- [ ] SQL/NoSQL injection prevention via parameterized queries + Mongoose
- [ ] CORS preflight caching to reduce OPTIONS requests
- [ ] Content Security Policy headers via helmet
- [ ] Logging: structured logs (winston/pino) without sensitive data

---

### 6. Real-time Features (Optional)

For live order updates, integrate **Socket.io**:

```javascript
const io = require('socket.io')(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyAccessToken(token);
  socket.userId = user.userId;
  socket.tenantId = user.tenantId;
  next();
});

io.on('connection', (socket) => {
  // Join tenant-specific room
  socket.join(`tenant-${socket.tenantId}`);

  // Emit order update to all staff in restaurant
  socket.on('order-updated', (order) => {
    io.to(`tenant-${socket.tenantId}`).emit('order-status', order);
  });
});
```

---

## VPS Deployment Strategy

### Production Folder Structure (on VPS)
```
/home/user/gastropay/
├── backend/               # Node.js app
├── frontend/              # React build output
├── .env.production        # Production env vars
├── docker-compose.yml     # Multi-container setup
└── nginx/                 # Reverse proxy config
```

### Docker Deployment (docker-compose.yml)
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  backend:
    build: ./backend
    ports: ["3001:3001"]
    depends_on: [mongo]
    environment:
      MONGO_URI: mongodb://admin:${MONGO_PASSWORD}@mongo:27017/gastropay
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      FRONTEND_URL: ${FRONTEND_URL}

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]

volumes:
  mongo_data:
```

### PM2 Process Management
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gastropay-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' }
  }]
};

# Run
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Reverse Proxy
```nginx
upstream backend {
  server 127.0.0.1:3001;
}

server {
  listen 80;
  server_name api.gastropay.com;

  location / {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
  }
}
```

---

## Package Dependencies Summary

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.0",
    "socket.io": "^4.7.0",
    "pino": "^8.16.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

---

## Project Structure (Recommended)

```
gastropay/
├── backend/
│   ├── src/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── README.md
└── docs/
    ├── api.md
    ├── schema.md
    └── deployment.md
```

---

## Implementation Priority

1. **Phase 1** (Weeks 1-2): Auth + CRUD for restaurants/menus/orders
2. **Phase 2** (Weeks 3-4): Dashboard UI + real-time order status
3. **Phase 3** (Week 5): Payment integration + email notifications
4. **Phase 4** (Week 6): Docker + VPS deployment + SSL

---

## Key Decision Points Recap

| Decision | Recommendation | Reason |
|----------|----------------|--------|
| State Management | Zustand + TanStack Query | Lightweight, no boilerplate, clear separation of client/server state |
| Multi-tenancy | Shared collections + tenantId | Simple, cost-effective for small-medium scale |
| Auth | JWT + refresh tokens | Stateless, scalable, works with VPS |
| API Validation | Zod | Type-safe, runtime validation, pairs well with TypeScript |
| Deployment | Docker + Nginx + PM2 | Industry standard, reproducible, VPS-friendly |

---

## Unresolved Questions

1. Will you support restaurant sub-accounts (managers, staff) with role-based permissions?
2. Payment gateway preference (Stripe, PayPal, local Vietnam gateway)?
3. Email/SMS notification service (Twilio, SendGrid)?
4. Analytics/reporting requirements for restaurants?
5. Estimated concurrent users per restaurant (affects WebSocket scale)?

---

## Sources

- [Tuvoc - Complete Guide to MERN Stack Development 2025](https://www.tuvoc.com/blog/complete-guide-mern-stack-development/)
- [Strapi - MERN Stack Guide](https://strapi.io/blog/mern-stack-guide-components-setup-best-practices)
- [MongoDB - Multi-Tenant Architecture Docs](https://www.mongodb.com/docs/atlas/build-multi-tenant-arch/)
- [DEV Community - State Management in 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [Corbado - Node.js Express JWT Authentication (2025)](https://www.corbado.com/blog/nodejs-express-mysql-jwt-authentication-roles)
- [FlymingoTech - JWT Authentication 2025 Guide](https://medium.com/@flymingotech/how-to-set-up-jwt-authentication-in-a-node-express-api-2025-guide-cd7e9ca5d196)
- [DigitalOcean - JWT in Express.js](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)
- [GeeksforGeeks - Multi-Tenant MongoDB](https://www.geeksforgeeks.org/dbms/build-a-multi-tenant-architecture-in-mongodb/)
