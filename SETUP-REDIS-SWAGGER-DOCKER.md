# ProjectTrack Redis, Swagger, and Docker setup

## Place the files

Copy each file into the matching project path. Replace `backend/server.js`,
`backend/package.json`, and `backend/config/database.js`. Add the remaining files.

## Install backend packages

From `P:\projecttrack\backend`:

```powershell
npm install redis rate-limit-redis swagger-ui-express yaml
```

This updates `package-lock.json`, which the backend Docker image needs for `npm ci`.

## Local Redis + Swagger test

Start Redis with Docker Desktop:

```powershell
docker run --name projecttrack-redis -p 6379:6379 -d redis:7-alpine
```

Add these values to the real `backend/.env`:

```env
REDIS_URL=redis://127.0.0.1:6379
REDIS_REQUIRED=false
DB_SSL=false
```

Restart the backend:

```powershell
npm run dev
```

Expected startup messages:

```text
Redis connected
Server running on http://localhost:5000
Swagger UI: http://localhost:5000/api/docs
```

Open:

- API health: http://localhost:5000/api/health
- Swagger UI: http://localhost:5000/api/docs
- OpenAPI JSON: http://localhost:5000/api/openapi.json

Use the Swagger **Authorize** button with the JWT only; Swagger adds `Bearer`.

## Run the full stack with Docker Compose

Stop separately running frontend/backend/PostgreSQL/Redis services if their ports
are already occupied. Ensure Docker Desktop is running.

From `P:\projecttrack`:

```powershell
Copy-Item .env.docker.example .env.docker
```

Edit `.env.docker` and set strong private values for `DB_PASSWORD` and
`JWT_SECRET`. Never commit `.env.docker`.

Then run:

```powershell
docker compose --env-file .env.docker up --build
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Swagger: http://localhost:5000/api/docs
- Health: http://localhost:5000/api/health

PostgreSQL is exposed on host port `5433` to avoid conflicting with a local
PostgreSQL server on `5432`.

## Useful commands

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker down
docker compose --env-file .env.docker down -v
```

Warning: `down -v` deletes Docker PostgreSQL, Redis, and uploaded-file volumes.
