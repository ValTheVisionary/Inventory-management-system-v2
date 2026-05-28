# Inventory Management System v2

A full-stack inventory management application for tracking products, categories, stock movements, low-stock alerts, users, and application settings. The project ships with an Express/Prisma API and a static HTML/CSS/JavaScript frontend served by the backend.

## Features

- JWT-based authentication with registration and login
- Role-based access control for `ADMIN`, `MANAGER`, and `STAFF` users
- Product catalog with SKU, category, description, price, stock, and reorder threshold fields
- Category management with icons and product counts
- Stock adjustments for inbound, outbound, and inventory count updates
- Automatic low-stock and out-of-stock alerts
- Dashboard API for inventory summaries
- User profile management and admin user management
- Settings storage by configurable section
- Static frontend pages for dashboard, products, categories, stock, alerts, users, settings, and authentication

## Tech Stack

### Backend

- Node.js
- Express 5
- Prisma ORM
- MySQL
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt password hashing

### Frontend

- HTML
- CSS
- Vanilla JavaScript

## Project Structure

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL server

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Inventory-management-system-v2
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="replace-with-a-secure-secret"
PORT=5000
```

Example for a local MySQL database:

```env
DATABASE_URL="mysql://root:password@localhost:3306/inventory_management"
JWT_SECRET="local-development-secret"
PORT=5000
```

> The application falls back to `dev_secret` if `JWT_SECRET` is not set, but you should always set a strong secret outside local experimentation.

### 4. Apply database migrations

```bash
npx prisma migrate deploy
```

For local development, you can also use:

```bash
npx prisma migrate dev
```

### 5. Start the application

Development mode with automatic restarts:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API and frontend are served from the same Express server. By default, open:

- Frontend: <http://localhost:5000>
- Health check: <http://localhost:5000/health>
- API base URL: <http://localhost:5000/api>

## Frontend Pages

The backend serves the static frontend from the `frontend` directory.

- `/auth.html` - login and registration
- `/index.html` - dashboard
- `/products.html` - product management
- `/categories.html` - category management
- `/stock.html` - stock adjustments
- `/alerts.html` - low-stock alerts
- `/users.html` - user management
- `/settings.html` - application settings

## API Overview

All routes below are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Log in and receive a JWT |

### Products

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/products` | List products | Authenticated |
| `POST` | `/products` | Create a product | Authenticated |
| `PUT` | `/products/:id` | Update a product | Authenticated |
| `DELETE` | `/products/:id` | Delete a product | `ADMIN`, `MANAGER` |

### Categories

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/categories` | List categories with product counts | Authenticated |
| `POST` | `/categories` | Create a category | Authenticated |
| `PUT` | `/categories/:id` | Update a category | Authenticated |
| `DELETE` | `/categories/:id` | Delete a category | `ADMIN`, `MANAGER` |

### Stock, Alerts, and Dashboard

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/stock/adjust` | Adjust product stock with `IN`, `OUT`, or `ADJUSTMENT` | Authenticated |
| `GET` | `/alerts` | List active low-stock alerts | Authenticated |
| `PATCH` | `/alerts/:id/dismiss` | Dismiss an alert | Authenticated |
| `GET` | `/dashboard` | Get dashboard summary data | Authenticated |

### Users and Settings

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Get the current user's profile | Authenticated |
| `PATCH` | `/users/me` | Update the current user's profile/password | Authenticated |
| `GET` | `/users` | List users | `ADMIN`, `MANAGER` |
| `POST` | `/users` | Create a user | `ADMIN` |
| `PUT` | `/users/:id` | Update a user | `ADMIN`, `MANAGER` |
| `DELETE` | `/users/:id` | Delete a user | `ADMIN` |
| `GET` | `/settings` | List settings by section | Authenticated |
| `PUT` | `/settings/:section` | Save one settings section | `ADMIN`, `MANAGER` |

## Example Requests

### Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"ChangeMe123!","role":"ADMIN"}'
```

### Log in

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
```

### Create a category

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","icon":"💻"}'
```

### Create a product

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"USB-C Cable","sku":"USB-C-001","description":"1m cable","stock":25,"reorderThreshold":5,"price":9.99,"categoryId":1}'
```

### Adjust stock

```bash
curl -X POST http://localhost:5000/api/stock/adjust \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"type":"OUT","quantity":2,"note":"Customer order"}'
```

## Database Models

The Prisma schema defines these main models:

- `User` - application users with role and status
- `Category` - product categories
- `Product` - inventory items and reorder thresholds
- `StockMovement` - stock adjustment history
- `Alert` - active or dismissed inventory alerts
- `Setting` - JSON settings grouped by section

## Available Scripts

Run these commands from the `backend` directory.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with `nodemon` |
| `npm start` | Start the API with Node.js |
| `npm test` | Placeholder test script currently exits with an error |

## Development Notes

- Keep API changes under `backend/src` when possible; `backend/controllers` and `backend/routes` appear to be legacy paths.
- The backend serves files from `frontend`, so frontend changes are available after refreshing the browser while the server is running.
- Low-stock alerts are created when product stock is less than or equal to the product reorder threshold.
- Outbound stock adjustments are rejected if they would make stock negative.

## License

This project currently uses the ISC license as declared in `backend/package.json`.
