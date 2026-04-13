# IoT Monitoring Dashboard

Full-stack IoT monitoring dashboard: React + Vite frontend, FastAPI (Python) backend, Nginx reverse proxy, Keycloak (OIDC/RBAC), TimescaleDB, Redis cache, MQTT ingestion via Mosquitto.

## Features

- **AuthN/AuthZ**: Keycloak OIDC + roles (ANALYST/ADMIN/MASTER), JWT validation, automatic token refresh.
- **Data plane**: MQTT ingestion via Mosquitto, real-time WebSocket, TimescaleDB with continuous aggregates, Redis cache.
- **Alerting**: Warning/Critical thresholds per sensor, real-time toast notifications, alert log with acknowledgement and audit trail.
- **Dashboard**: historical charts (1h/6h/12h/24h), gauges, KPIs, sensors/assets/locations pages.
- **Security**: rate limiting (slowapi + Redis), CORS allowlist, TrustedHost middleware, OIDC tokens.
- **Deployment**: full Docker Compose stack, Nginx reverse proxy, automatic data generator.

## Architecture

Browser (React/Vite SPA)
|
| HTTP/WS
v
+-------------------------------+
| Nginx reverse proxy (:80) |
| - serves SPA |
| - /api -> FastAPI (:8000) |
| - /ws -> FastAPI WebSocket |
+-------------------------------+
|
v
+-------------------------------+
| FastAPI (Python/Uvicorn) |
| - OIDC/RBAC, rate limiting |
| - REST API, WebSocket |
| - MQTT subscriber |
+-------------------------------+
| ingestion | storage/cache
v v
+-------------+ +------------------+
| Mosquitto | | TimescaleDB |
| MQTT broker | | Redis (cache) |
+-------------+ +------------------+
Keycloak (:8090) for tokens

## Repository layout

- `frontend/` — React/Vite SPA (routes, Zustand state, API/OIDC/WebSocket services, Recharts).
- `server/` — FastAPI backend, routes, CRUD, SQLAlchemy models, Keycloak auth, MQTT handler.
- `server/scripts/` — MQTT data generator to simulate sensors.
- `nginx/` — Nginx reverse proxy configuration.
- `mosquitto/` — Mosquitto MQTT broker configuration.
- `docker-compose.yml` — full stack (nginx, server, keycloak, db, redis, mosquitto, data-generator).

## Quickstart (Docker Compose)

```bash
# From project root
docker compose up -d --build
```

Available services:

- Frontend: http://localhost
- Keycloak: http://localhost:8090
- TimescaleDB: localhost:5432

## Quickstart (Local Dev)

```bash
# Start Docker services
docker compose up -d db redis keycloak mosquitto

# Backend
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

- Frontend dev: http://localhost:5173
- Backend dev: http://localhost:8000/docs
