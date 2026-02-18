# Korda CRUD API

A REST API for managing **Users**, **Payloads**, and **Devices** built with Node.js, Express, and MongoDB.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework / routing |
| MongoDB | Database (NoSQL) |
| Mongoose | MongoDB object modeling |
| dotenv | Environment variables |
| Helmet | Security HTTP headers |
| CORS | Cross-origin request support |
| Morgan | Request logging |
| express-validator | Input validation |
| nodemon | Auto-restart in development |

---

## Project Structure

```
korda-crud-api/
├── server.js                   ← Entry point, connects to MongoDB
├── .env                        ← Your environment variables
├── package.json
└── src/
    ├── app.js                  ← Express app setup, routes mounted here
    ├── controllers/
    │   ├── base.controller.js  ← Shared CRUD logic for all collections
    │   ├── user.controller.js
    │   ├── payload.controller.js
    │   └── device.controller.js
    ├── models/
    │   ├── user.model.js
    │   ├── payload.model.js
    │   ├── device.model.js
    │   └── columnPreference.model.js
    ├── routes/
    │   └── index.js            ← Auto-generates 8 routes per collection
    ├── middleware/
    │   └── validate.js         ← ID and body validation
    └── utils/
        ├── filter.js           ← AND / OR filter engine
        ├── pagination.js       ← Page / limit / sort logic
        ├── response.js         ← Consistent JSON response helpers
        └── columns.js          ← Column visibility logic
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Create `.env` File

Create a `.env` file in the root of the project:

```env
MONGO_URI=mongodb://localhost:27017/crud_api
PORT=3000
```

### 3. Start the Server

```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

You should see:

```
✅ MongoDB connected
🚀 Server running at http://localhost:3000
```

### 4. Health Check

```
GET http://localhost:3000/health
```

```json
{ "status": "ok" }
```

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique, lowercased |
| `phone` | String | Optional |
| `role` | String | `admin` \| `user` \| `moderator` (default: `user`) |
| `isActive` | Boolean | Default: `true` |
| `lastLoginAt` | Date | Optional, can be `null` |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### Payload

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Reference to User |
| `logDate` | Date | Required |
| `stepCount` | Number | Default: `0` |
| `device` | String | e.g. `iPhone`, `Android` |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### Device

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Reference to User |
| `logDate` | Date | Required |
| `stepCount` | Number | Default: `0` |
| `device` | String | e.g. `iPhone`, `Android` |
| `batteryLevel` | Number | `0–100` |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

---

## API Routes

Every collection gets the same **8 routes** automatically.  
Replace `/api/users` with `/api/payloads` or `/api/devices` as needed.

| Method | URL | Action | Notes |
|--------|-----|--------|-------|
| `GET` | `/api/users` | Get all users | Supports filter, pagination, sort |
| `GET` | `/api/users/:id` | Get one user | Pass a valid MongoDB ObjectId |
| `POST` | `/api/users` | Create user | Send data in Body as JSON |
| `PUT` | `/api/users/:id` | Update user | Send only fields to change |
| `DELETE` | `/api/users/:id` | Delete one user | Permanent |
| `DELETE` | `/api/users/bulk` | Delete many users | Send `{ ids: [...] }` in Body |
| `GET` | `/api/users/columns` | Get column config | Returns visible/hidden columns |
| `PUT` | `/api/users/columns` | Update column config | Change visibility and order |

---

## Pagination & Sorting

Add these as query params to any `GET` request:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `10` | Results per page (max `100`) |
| `sort` | `createdAt` | Field to sort by |
| `sortOrder` | `desc` | `asc` or `desc` |

**Example:**

```
GET /api/users?page=2&limit=5&sort=name&sortOrder=asc
```

---

## Filter Engine

Send a `filter` object in the **request Body** alongside your pagination query params.

### Filter Shape

```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "role",     "op": "eq",    "value": "admin" },
      { "field": "isActive", "op": "eq",    "value": true    },
      { "field": "email",    "op": "regex", "value": "gmail" }
    ]
  }
}
```

### Supported Operators

| `op` | Meaning | Example Value |
|------|---------|---------------|
| `eq` | Equals | `"admin"` |
| `ne` | Not equals | `"user"` |
| `gt` | Greater than | `100` |
| `gte` | Greater than or equal | `"2025-01-01T00:00:00Z"` |
| `lt` | Less than | `50` |
| `lte` | Less than or equal | `"2024-12-31T23:59:59Z"` |
| `in` | Value is in array | `["admin", "moderator"]` |
| `nin` | Value is NOT in array | `["user"]` |
| `regex` | Partial text match (case-insensitive) | `"gmail"` |
| `exists` | Field exists / is not null | `true` or `false` |

### Filter Examples

**AND — All conditions must match**

```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "role",     "op": "eq", "value": "admin" },
      { "field": "isActive", "op": "eq", "value": true    }
    ]
  }
}
```

**OR — Any condition can match**

```json
{
  "filter": {
    "operator": "OR",
    "conditions": [
      { "field": "role", "op": "eq", "value": "admin"     },
      { "field": "role", "op": "eq", "value": "moderator" }
    ]
  }
}
```

**Shorthand using `in` (same as OR above)**

```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "role", "op": "in", "value": ["admin", "moderator"] }
    ]
  }
}
```

**Nested — OR inside AND**

```json
{
  "filter": {
    "operator": "AND",
    "conditions": [
      { "field": "isActive", "op": "eq", "value": true },
      {
        "operator": "OR",
        "conditions": [
          { "field": "role", "op": "eq", "value": "admin"     },
          { "field": "role", "op": "eq", "value": "moderator" }
        ]
      }
    ]
  }
}
```

**Quick Query-String Filters (no Body needed)**

```
GET /api/users?role=admin
GET /api/users?isActive=true&role=moderator
GET /api/users?lastLoginAt[gte]=2025-01-01
GET /api/users?lastLoginAt[exists]=true
```

> ⚠️ Query params only support AND logic. Use the Body filter for OR.

---

## Response Format

Every API response has the same shape.

**Success (200 / 201)**

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error (400 / 404 / 500)**

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `500 — E11000 duplicate key` | Email already exists in DB | Use a different, unique email |
| `400 — Invalid ID` | ObjectId format is wrong | Copy `_id` exactly from a GET response |
| `deletedCount: 0` | IDs don't exist in database | Use real IDs from Get All response |
| `404 — Resource not found` | ID format is valid but not in DB | Verify with `GET /api/users/:id` |
| `500 — DB connection failed` | Wrong `MONGO_URI` in `.env` | Check `.env` and ensure MongoDB is running |

---

## Adding a New Collection

The project is built to extend easily — just 3 steps:

**1.** Create your model in `src/models/thing.model.js`

**2.** Create your controller in `src/controllers/thing.controller.js`

```js
const BaseController = require("./base.controller");
const Thing = require("../models/thing.model");

class ThingController extends BaseController {
  constructor() { super(Thing); }
}

module.exports = new ThingController();
```

**3.** Mount the route in `src/app.js`

```js
const thingController = require("./controllers/thing.controller");
app.use("/api/things", createRouter(thingController));
```

That's it — all 8 routes are automatically available for the new collection.

---

## Filterable Fields per Collection

| Collection | Filterable Fields |
|------------|-------------------|
| Users | `name`, `email`, `phone`, `role`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt` |
| Payloads | `userId`, `logDate`, `stepCount`, `device`, `createdAt`, `updatedAt` |
| Devices | `userId`, `logDate`, `stepCount`, `device`, `batteryLevel`, `createdAt`, `updatedAt` |
