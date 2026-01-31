# High-Scale Energy Ingestion Engine

A high-performance NestJS backend for ingesting and analyzing telemetry from 10,000+ Smart Meters and EV Fleets. Built with PostgreSQL for hot/cold data storage and optimized analytical queries.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INGESTION LAYER                          │
│  ┌──────────────────┐        ┌───────────────────┐              │
│  │   Smart Meter    │        │    EV Vehicle     │              │
│  │   (Grid Side)    │        │  (Vehicle Side)   │              │
│  │ kwhConsumedAc    │        │  kwhDeliveredDc   │              │
│  │    voltage       │        │   SoC, batteryTemp│              │
│  └────────┬─────────┘        └─────────┬─────────┘              │
│           │                            │                         │
│           ▼                            ▼                         │
│  ┌────────────────────────────────────────────────┐             │
│  │            POST /v1/telemetry/*                │             │
│  │         (Polymorphic Ingestion)                │             │
│  └─────────────────────┬──────────────────────────┘             │
└─────────────────────────┬────────────────────────────────────────┘
                          │
┌─────────────────────────┴────────────────────────────────────────┐
│                      PERSISTENCE LAYER                            │
│  ┌────────────────────────┐    ┌────────────────────────┐        │
│  │      HOT STORE         │    │      COLD STORE        │        │
│  │   (Operational)        │    │    (Historical)        │        │
│  │                        │    │                        │        │
│  │  • meter_status        │    │  • meter_readings_     │        │
│  │  • vehicle_status      │    │      history           │        │
│  │                        │    │  • vehicle_readings_   │        │
│  │  UPSERT (latest state) │    │      history           │        │
│  │  O(1) lookups          │    │  INSERT (append-only)  │        │
│  └────────────────────────┘    └────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┴────────────────────────────────────────┐
│                      ANALYTICS LAYER                              │
│  ┌────────────────────────────────────────────────┐              │
│  │    GET /v1/analytics/performance/:vehicleId    │              │
│  │                                                │              │
│  │  • 24-hour energy summary (AC vs DC)           │              │
│  │  • Efficiency Ratio calculation                │              │
│  │  • Health status (HEALTHY/WARNING/CRITICAL)    │              │
│  └────────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Data Strategy

### Hot vs Cold Storage

| Aspect | Hot Store (Operational) | Cold Store (Historical) |
|--------|------------------------|------------------------|
| **Purpose** | Dashboard "current status" | Audit trail & analytics |
| **Operation** | UPSERT (atomic update) | INSERT (append-only) |
| **Rows per device** | 1 | Millions over time |
| **Query speed** | O(1) primary key lookup | Indexed range scans |
| **Tables** | `meter_status`, `vehicle_status` | `*_readings_history` |

### Handling 14.4 Million Records Daily

| Metric | Value |
|--------|-------|
| Devices | 10,000 meters + 10,000 vehicles |
| Frequency | 60-second heartbeats |
| Daily readings/device | 1,440 |
| **Total daily records** | **28.8M** (both streams) |

**Optimization strategies:**
1. **Composite Indexes** - `(deviceId, timestamp)` for range queries
2. **Hot/Cold Separation** - Dashboard hits small status tables
3. **Append-only writes** - No UPDATE contention for history
4. **Connection pooling** - TypeORM manages PostgreSQL connections

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Start the services:**
   ```bash
   cd energy-ingestion-engine
   docker-compose up -d --build
   ```

2. **Access Swagger Documentation:**
   Open [http://localhost:3000/api](http://localhost:3000/api) to view interactive API docs.

3. **Verify services:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

### Local Development

1. **Start PostgreSQL:**
   ```bash
   docker run -d --name energy_postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=energy_db \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Install & Run:**
   ```bash
   npm install
   npm run start:dev
   ```

## 📡 API Endpoints

**Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)

### Telemetry Ingestion

#### POST /v1/telemetry/meter
Ingest Smart Meter telemetry (Grid Side)

```bash
curl -X POST http://localhost:3000/v1/telemetry/meter \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "METER-001",
    "kwhConsumedAc": 150.5,
    "voltage": 240,
    "timestamp": "2026-01-31T14:00:00Z"
  }'
```

#### POST /v1/telemetry/vehicle
Ingest EV Vehicle telemetry (Vehicle Side)

```bash
curl -X POST http://localhost:3000/v1/telemetry/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEH-001",
    "soc": 75,
    "kwhDeliveredDc": 127.5,
    "batteryTemp": 32,
    "timestamp": "2026-01-31T14:00:00Z"
  }'
```

### Status Queries (Hot Store)

#### GET /v1/telemetry/meter/:meterId/status
Get current meter status

```bash
curl http://localhost:3000/v1/telemetry/meter/METER-001/status
```

#### GET /v1/telemetry/vehicle/:vehicleId/status
Get current vehicle status

```bash
curl http://localhost:3000/v1/telemetry/vehicle/VEH-001/status
```

### Analytics

#### GET /v1/analytics/performance/:vehicleId
Get 24-hour performance summary

```bash
curl http://localhost:3000/v1/analytics/performance/VEH-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicleId": "VEH-001",
    "period": {
      "start": "2026-01-30T14:00:00.000Z",
      "end": "2026-01-31T14:00:00.000Z"
    },
    "totalAcConsumed": 150.5,
    "totalDcDelivered": 127.5,
    "efficiencyRatio": 0.8472,
    "efficiencyPercent": "84.72%",
    "avgBatteryTemp": 32,
    "readingsCount": {
      "vehicle": 1440,
      "meter": 1440
    },
    "healthStatus": "WARNING"
  }
}
```

## 🔬 Power Loss Thesis

In real-world charging:
- **AC Consumed** (from grid) is always higher than **DC Delivered** (to battery)
- Loss occurs due to heat and AC→DC conversion
- Efficiency below 85% indicates potential issues

| Efficiency | Health Status | Meaning |
|------------|--------------|---------|
| ≥ 85% | HEALTHY | Normal operation |
| 70-85% | WARNING | Investigate |
| < 70% | CRITICAL | Hardware fault/energy leakage |

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Generate Test Data (Simulation)

To simulate hundreds of readings from multiple devices:

```bash
# If running with Docker (using locally built script)
node dist/scripts/generate-test-data.js --vehicles 5 --hours 2

# OR if running locally
npx ts-node scripts/generate-test-data.ts --vehicles 5 --hours 2
```

## 📁 Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point with Swagger
├── database/
│   ├── database.module.ts     # TypeORM configuration
│   └── entities/
│       ├── meter-reading-history.entity.ts    # Cold store
│       ├── meter-status.entity.ts             # Hot store
│       ├── vehicle-reading-history.entity.ts  # Cold store
│       └── vehicle-status.entity.ts           # Hot store
├── telemetry/
│   ├── telemetry.module.ts
│   ├── telemetry.controller.ts
│   ├── telemetry.service.ts   # Dual-write logic
│   └── dto/
│       ├── meter-telemetry.dto.ts
│       └── vehicle-telemetry.dto.ts
└── analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts   # 24-hour performance query
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_HOST | localhost | PostgreSQL host |
| DATABASE_PORT | 5432 | PostgreSQL port |
| DATABASE_USERNAME | postgres | Database user |
| DATABASE_PASSWORD | postgres | Database password |
| DATABASE_NAME | energy_db | Database name |
| PORT | 3000 | Application port |

## 📜 License

MIT
