# Instant Panel — Production Stack

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for running the server directly)

## Quick Start

```bash
# 1. Edit secrets
#    Open .env and change ALL passwords before deploying:
#    - MONGO_ROOT_PASSWORD
#    - MONGO_EXPRESS_PASSWORD
#    - GRAFANA_PASSWORD
#    - METRICS_AUTH_TOKEN

# 2. Start everything (app + infra + monitoring)
docker compose -f docker-compose.prod.yml up -d

# 3. Start the server (runs on host, not in Docker)
mkdir -p logs && LOG_FORMAT=json node index.js >> logs/server.log 2>&1 &

# 4. Open Grafana — http://localhost:3002  (admin / <GRAFANA_PASSWORD>)
```

## Services

| Service | Host Port | Internal | Auth |
|---|---|---|---|
| **Frontend** | `3101` | `3000` | — |
| **Backend API** | `5100` | `5000` | JWT |
| **MongoDB** | `27019` | `27017` | `rootUser` / `.env` |
| **Mongo Express** | `8082` | `8081` | `admin` / `.env` |
| **Redis** | `6381` | `6379` | none |
| **RabbitMQ** | `5673` | `5672` | `guest` / `.env` |
| RabbitMQ Admin | `15673` | `15672` | `guest` / `.env` |
| RabbitMQ Stream | `5553` | `5552` | same |
| RabbitMQ Metrics | `15693` | `15692` | — |
| **Prometheus** | `9091` | `9090` | — |
| **Grafana** | `3002` | `3000` | `admin` / `.env` |
| **Loki** | `3102` | `3100` | — |
| MongoDB Exporter | `9217` | `9216` | — |
| Redis Exporter | `9122` | `9121` | — |

## .env File

All secrets and URLs live in `.env`. Docker Compose reads it automatically via `${VAR}` substitution.

```bash
# Example — change these
MONGO_ROOT_PASSWORD=your-strong-password
GRAFANA_PASSWORD=your-grafana-password
```

Backend and frontend containers get the full `.env` via `env_file`. Infra services (MongoDB, RabbitMQ, Grafana) only get the variables they need.

## Logs

Server logs go to `./logs/server.log`. Promtail tails this file and ships to Loki.

```bash
# Production JSON logs (required for Promtail to parse)
LOG_FORMAT=json node index.js >> logs/server.log 2>&1 &

# Dev pretty-print (no Promtail)
node index.js
```

## Auto-Updates

Watchtower checks for new ghcr images every 5 minutes. When a new version of `instant-frontend` or `instant-backend` is pushed, it pulls and recreates the container automatically.

```bash
# To trigger an immediate check:
docker exec watchtower-v2 watchtower --run-once
```

## Monitoring

Grafana loads a pre-configured dashboard with panels for:
- HTTP request rate, duration (p50/p95/p99), active connections
- CPU, memory, event loop lag (Node.js runtime)
- RabbitMQ queue depth and publish/deliver rates
- MongoDB connections
- Redis clients and memory
- Live logs (Loki)

Prometheus scrapes:
- `backend:9092/metrics` — primary cluster metrics
- `rabbitmq:15692/metrics` — RabbitMQ
- `mongodb-exporter:9216` — MongoDB
- `redis-exporter:9121` — Redis
- `grafana:3000/metrics` — Grafana itself

## Useful Commands

```bash
# View logs for a service
docker logs -f instant-backend-v2

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Full rebuild (after .env changes)
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop + delete volumes (wipes all data)
docker compose -f docker-compose.prod.yml down -v
```

## File Reference

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` | All services (app + infra + monitoring) |
| `.env` | Secrets and configuration |
| `prometheus.yml` | Scrape targets |
| `loki-config.yml` | Loki storage |
| `promtail-config.yml` | Log tailing config |
| `grafana/datasources.yml` | Grafana datasource provisioning |
| `grafana/dashboards.yml` | Grafana dashboard auto-loading |
| `grafana/dashboards/instant-panel.json` | Dashboard panels |
