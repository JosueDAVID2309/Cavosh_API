# AGENTS.md - Cavosh Cafe API (Node.js)

## Build & Run

| Command | Description |
|---|---|
| `npm install` | Install dependencies (run once after cloning) |
| `npm run dev` | Start server in development mode with nodemon (hot reload) |
| `npm start` | Start server in production mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix issues |

## Database Setup

1. Ensure MySQL is running on `localhost:3306`
2. Create `.env` from `.env.example` and adjust credentials
3. The app auto-creates tables via `sequelize.sync({ alter: true })` in development
4. For production, run: `sequelize db:migrate`
5. To manually create the database, run: `mysql -u root < src/data/schema.sql`
6. Seed data (user `usuario@cavosh.com`, password `123456`) is auto-seeded on startup in dev mode

## Project Structure

```
src/
├── app.js            # Express app setup (middleware, routes, error handler)
├── server.js         # Entry point: connects DB, syncs models, seeds, starts server
├── config/
│   ├── database.js   # Sequelize connection config
│   └── cors.js       # CORS middleware config
├── models/           # Sequelize models + index (associations)
├── services/         # Business logic (7 services)
├── controllers/      # HTTP controllers (7 controllers)
├── routes/           # Express routers (7 routers + health)
├── dtos/             # Response DTOs
├── exceptions/       # Custom error classes
├── middleware/       # Express middleware (error handler)
├── utils/            # Helpers (decimal math, seed script)
└── data/
    └── schema.sql    # Raw SQL schema
```

## API Base URL

```
http://localhost:8080/api
```

All routes are prefixed with `/api`. CORS is set to allow all origins (`*`).
