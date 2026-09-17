  # Task API with Supabase Auth

  A Node.js + Express REST API with PostgreSQL and Supabase Authentication.

  ## Setup

  1. Clone the repo:


git clone https://github.com/zainkhan2004/todo-api.git cd todo-api


  2. Install dependencies:


npm install


  3. Set up environment variables:


cp .env.example .env

  Edit `.env` with your Supabase credentials and database URL.

  4. Start PostgreSQL in Docker:


docker compose up db -d


  5. Run the server:


node --env-file=.env server.js


  Server runs on `http://localhost:3000`

  ## API Reference

  ### Public Routes
  - `GET /public/info` — Public information
  - `GET /health` — Health check (database status)
  - `GET /docs` — Swagger UI documentation

  ### Auth Routes
  - `POST /auth/signup` — Create account (email, password)
  - `POST /auth/login` — Login, returns access_token and refresh_token
  - `POST /auth/logout` — Logout (requires Bearer token)

  ### Protected Routes (require `Authorization: Bearer <token>`)
  - `GET /protected/profile` — Get authenticated user profile
  - `GET /protected/dashboard` — User dashboard

  ### Task Routes
  - `GET /tasks` — List all tasks (optional: ?done=true, ?search=text)
  - `POST /tasks` — Create task
  - `GET /tasks/:id` — Get task by ID
  - `PUT /tasks/:id` — Update task
  - `DELETE /tasks/:id` — Delete task
  - `GET /stats` — Task statistics

  ## Authentication

  1. Sign up:


curl -X POST http://localhost:3000/auth/signup    -H "Content-Type: application/json"    -d '{"email":"user@example.com","password":"password123"}'


  2. Login:


curl -X POST http://localhost:3000/auth/login    -H "Content-Type: application/json"    -d '{"email":"user@example.com","password":"password123"}'


  3. Use token on protected routes:


curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN"    http://localhost:3000/protected/profile


  ## Swagger Documentation

  Open `http://localhost:3000/docs` in your browser.

  - Click the **Authorize** button (top-right)
  - Paste your Bearer token from login
  - All protected routes show lock icons and work with authorized token

  ## Tech Stack

  - Node.js + Express
  - PostgreSQL (Docker)
  - Supabase Authentication
  - Swagger UI (OpenAPI 3.0)

  ## Stages Implemented

  - ✓ Stage 0: Environment setup
  - ✓ Stage 1: Signup/Login auth routes
  - ✓ Stage 2: Public and protected endpoints with Bearer check
  - ✓ Stage 3: Token verification with Supabase
  - ✓ Stage 4: Auth middleware and protected routes
  - ✓ Stage 5: Swagger with bearer authentication
  - ✓ Stage 6: GitHub, documentation, .env.example
