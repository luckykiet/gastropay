# GastroPay POS Integration Scout Report
**Date**: 2025-12-13 | **Codebase**: project-ops | **Target**: Integration analysis

---

## Project Overview

**Type**: Node.js/Express-based Point of Sale (POS) System  
**Database**: MongoDB  
**Structure**: Monolithic backend (not monorepo) with Express routing patterns  
**Architecture**: Multi-tenant with subdomain-based company isolation

### Core Stack
- **Runtime**: Node.js ≥20.4.0
- **Framework**: Express.js 4.18.2
- **DB**: MongoDB 4.2.24 + Mongoose 7.5.2
- **Session**: express-session + connect-mongo
- **Auth**: Passport.js (local strategy)
- **Build**: Gulp 4.0.2 with BrowserSync
- **Frontend**: jQuery + Pug templates
- **Tests**: Jest 30.0.2 with integration tests

---

## Multi-Tenant Architecture

### Subdomain Routing (Critical for GastroPay)
- **Location**: `/routes/index.js` (lines 9-68)
- **Mechanism**: Express extracts subdomain via `req.subdomains` and `req.hostname`
- **Pattern**: `subdomain.domain` → each company has unique subdomain
- **Domain Config**: `/config.js` (lines 1-5) defines `gokasa.cz` as primary domain
- **Validation**: Subdomains must match `/^[a-z0-9]{0,32}$/` pattern
- **Reserved subdomains**: dealer, admin, app, signup, registration, assortment, barcodes

### Multi-Level Data Structure
```
Retail (Company)
  ├── subdomain: String (unique, indexed)
  ├── name, email, tin, vat, address
  ├── users: [userId] → staff accounts
  ├── registers: [registerId] → physical POS terminals
  └── features: customer, voucher, stock, admin flags

Register (POS Terminal)
  ├── number, name, subdomain (from parent Retail)
  ├── address, bank info, currency, tax_rates
  ├── gastropay: {} → GastroPay feature config
  ├── syncRegisterId → sync with another register
  └── tables, quickSales → order management

User (Staff Account)
  ├── username: "subdomain:username"
  ├── retailId, registerId
  ├── role: Admin|Manager|Seller
  └── privileges: [String] → granular permissions

Buttons (UI Config for Register)
  ├── registerId: ObjectId
  ├── tabs: [] → quick sales sections
  └── tableTabs: [] → table management
```

---

## GastroPay Integration Points

### 1. Order Management API
**Endpoints**: `/public/gastropay/*` (unauthenticated public routes)

#### POST `/public/gastropay/verify`
- **Purpose**: Validate register key before order submission
- **Input**: `key` (register ObjectId)
- **Validation**: Checks if register exists + `gastropay` feature enabled
- **Response**: Success/error with register metadata

#### GET `/public/gastropay/resources`
- **Purpose**: Fetch restaurant config, menu items, tables for POS integration
- **Input**: `key` (register ObjectId)
- **Returns**:
  - Register name, currency, tax settings
  - Enabled tables (those with `gastropay: true`)
  - Menu sections (quick sales marked `gastropay: true`)
  - Product catalog (articles, groups, modifiers, surcharges)
  - Image URLs (prefixed via `utils.imageServerPrefix`)
- **Sync feature**: Uses `syncRegisterId` if register has sync enabled

#### POST `/public/gastropay/order`
- **Purpose**: Create new order from external payment gateway
- **Input validation**:
  - `key`: valid ObjectId (register ID)
  - `totalPrice`: decimal format `/^\d{1,10}(\.\d{1,2})?$/`
  - `paymentGate`: "comgate" | "csob"
  - `paymentId`: up to 64 chars (unique per gateway)
  - `tableId`: valid ObjectId or empty
  - `items`: JSON array of order items
  - `tableName`: up to 32 chars
- **Item fields** (validated):
  - `ean`, `price`, `quantity`, `note`, `mods` (A-Z format)
- **Duplicate protection**: Unique index on `(paymentId, paymentGate)`
- **Response**: Returns `_id`, `status: 'received'`
- **Date handling**: Stores ISO timestamp + `d` (date prefix for indexing)

#### GET `/public/gastropay/order`
- **Purpose**: Poll order status after submission
- **Input**: `key` (register), `_id` (order ObjectId)
- **Returns**: `orderNumber`, `callingNumber`, `status`, `callingDate`, `date`

#### POST `/public/gastropay/order/status`
- **Purpose**: Update order status from POS (called by cashier system)
- **Valid statuses**: "calling" | "recalling" | "deleted" | "finished"
- **Required**: `key`, `orderId`, `status`, optional `callingDate`
- **Used by**: `/mod/*/quicksales.js` and other internal routes

#### API `/api/gastropay/*` (authenticated)
- **GET `/api/gastropay/orders`**: Fetch orders for authenticated register
  - Returns orders with status='received'
  - Accessible only by register owner (via middleware)
- **POST `/api/gastropay/orderpending`**: Mark order as pending (internal)

### 2. Database Model
**File**: `/models/GastropayOrders.js`

```javascript
{
  registerId: ObjectId,        // which POS terminal
  d: Number,                   // date prefix (yyyymmdd) for sharding
  date: Date,                  // ISO timestamp
  totalPrice: String,          // formatted currency
  tableName: String,           // "Table 5" or delivery address
  tableId: ObjectId,           // reference to Buttons.tableTabs[].tables[i]._id
  items: [                     // order line items
    {
      ean, price, quantity, note, mods, // from POS catalog
      id, _id, name, tax, group, printed // additional fields
    }
  ],
  paymentId: String,           // external payment ID
  paymentGate: String,         // "comgate" | "csob"
  status: String,              // 'received' → 'calling' → 'finished'
  callingDate: Date,           // when order was marked for calling/printing
  callingNumber: String,       // display number on kitchen screen
  orderNumber: Number          // sequence in register
}
```

**Indexes**:
- `status: 1` → filter received orders
- `(registerId, d): 1, -1` → most recent date prefix
- `(paymentId, paymentGate): unique` → prevent duplicate payments

### 3. Table Management
**File**: `/routes/mod/tables.js` (lines 1-80)

- Tables are stored in `Buttons.tableTabs[].tables[]`
- Each table has `_id`, `table_name`, `table_desc`, `bg`, `gastropay: Boolean`
- **GastroPay flag**: Tables flagged with `gastropay: true` are exposed via `/public/gastropay/resources`
- **Privilege check**: Only users with `settings` privilege or `tables` permission can modify
- Tables can be moved between tabs (UI organization)
- Table IDs referenced in `GastropayOrders.tableId` for order-to-table linking

### 4. Configuration
**File**: `/routes/mod/quicksales.js` and `/routes/mod/addorder.js`

- Order creation validates item EANs against catalog
- Items with `gastropay: true` are exposed to external system
- Register can sync catalog from another register via `syncRegisterId`
- Quick sales (menu items) also support `gastropay` flag

---

## Authentication & Authorization

### User Authentication
- **Strategy**: Passport local (username/password)
- **Sessions**: MongoDB-backed via connect-mongo
- **User schema** (`/models/Users.js`):
  - `username`: "subdomain:username" format
  - `retailId`, `registerId`: tenant isolation
  - `role`: Admin|Manager|Seller → privilege escalation
  - `privileges: [String]` → granular feature access

### Endpoint Security
- **Public routes**: `/public/*` require only valid register key
- **API routes**: `/api/*` require authentication via `ensureAuthenticated` middleware
- **Mod routes**: `/mod/*` require authentication + privilege checks

### Key Validation (Public API)
- `req.body.key` or `req.query.key` verified via `verifyKey()` function
- Checks: ObjectId validity + register exists + `register.gastropay` enabled
- Returns register metadata on success

---

## Real-Time & Async Features

### No WebSocket/Socket.io Implementation
- **Finding**: No `socket.io`, `ws`, or similar dependencies in package.json
- **Order polling**: System uses HTTP polling pattern (GET `/public/gastropay/order`)
- **Status updates**: POST to `/public/gastropay/order/status` from POS
- **Implication**: GastroPay integration is request-response based, not real-time push

### Scheduled Jobs
- **Module**: `node-schedule 2.1.1`
- **Files**: Not visible in routes (likely in background tasks)
- **Use case**: Potentially for order timeout handling, payment gateway reconciliation

---

## API Endpoints Summary

### Public (Unauthenticated, Key-based)
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/public/gastropay/verify` | Validate register key |
| GET | `/public/gastropay/resources` | Fetch menu + tables config |
| POST | `/public/gastropay/order` | Submit new order |
| GET | `/public/gastropay/order` | Check order status |
| POST | `/public/gastropay/order/status` | Update order status |

### Authenticated API
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/gastropay/orders` | Get received orders (register owner only) |
| POST | `/api/gastropay/orderpending` | Mark order pending |

### Internal Mod Routes
- `/mod/tables` - Manage table configuration
- `/mod/quicksales` - Manage menu items
- `/mod/addorder` - Add/update orders from POS

---

## Key Files for Integration

| File | Purpose |
|------|---------|
| `/models/GastropayOrders.js` | Order schema (24 lines) |
| `/models/Registers.js` | Register/POS terminal config (200+ lines) |
| `/models/Buttons.js` | UI config: tables + quick sales |
| `/models/Retails.js` | Company/tenant master data |
| `/models/Users.js` | Authentication + authorization |
| `/routes/api/gastropay.js` | API endpoints (305 lines) |
| `/routes/public/gastropay.js` | Public order management (120 lines) |
| `/routes/mod/tables.js` | Table management |
| `/routes/index.js` | Subdomain routing + tenant routing |
| `/config.js` | Domain + deployment configuration |
| `/app.js` | Route registration + middleware setup |

---

## Integration Recommendations

### For GastroPay Bootstrap
1. **Use public endpoints** for order submission (key-based, no auth overhead)
2. **Implement retry logic** for polling pattern (GET order status endpoint)
3. **Table management**: Create tables via UI or extend model with gastropay-specific fields
4. **Catalog sync**: Verify EANs match between GastroPay menu + POS catalog
5. **Duplicate handling**: Always include `paymentId + paymentGate` to prevent duplicates
6. **Date handling**: Store ISO dates; `d` field auto-populated for indexing
7. **Status flow**: received → calling → finished (or deleted)

### Data Reuse Opportunities
- **Buttons model**: Extend to support additional GastroPay metadata (print queue, display settings)
- **Registers model**: `gastropay` object already exists, add payment gateway credentials here
- **Orders model**: Link GastropayOrders to internal Orders via receipt number
- **Users model**: Track which staff approved gastropay orders

---

## Unresolved Questions
- How are payment credentials (Comgate/CSOB) stored securely in `register.gastropay` object?
- Is order reconciliation automated or manual?
- How long does polling timeout before marking order as abandoned?
- Are there webhooks from payment gateways that trigger order status updates?

