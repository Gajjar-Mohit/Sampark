# SAMPARK: Seamless And Modern Payment Architecture for Rapid Transactions and Knowledge

## Overview

SAMPARK is an open-source project that simulates the architectural patterns and event flows of India's digital payment ecosystem. It provides a realistic reference model without replicating actual internal operations of real payment networks, serving as a practical blueprint for engineers exploring financial technology architectures and distributed system design.

## Architecture

SAMPARK implements a multi-layered architecture mirroring real-world payment ecosystems:

### Core Components

- **National Transaction Hub (NTH)**: Central payment switch similar to NPCI's role
- **Payment Service Providers (PSPs)**: Banks providing backend services
- **Third Party Payment Applications (TPAP)**: Consumer-facing payment interfaces

### Supported Transaction Types

- **UPI**: Unified Payments Interface
- **IMPS**: Immediate Payment Service

## System Architecture

### UPI Transaction Flow
```
[BazzarPe] → [PSP: Paisa Vasool Bank] → [NTH] → [PSP: Babu Rao Ganpatrao Bank] → [ChillarPay]
```

### IMPS Transaction Flow
```
[Remitter Bank] → [NTH] → [Beneficiary Bank]
```

### Transaction Journey
1. **Initiation**: User initiates payment through TPAP
2. **PSP Processing**: Sponsoring bank validates and processes
3. **Central Routing**: NTH routes transaction to destination PSP
4. **Settlement**: Destination PSP credits beneficiary account
5. **Confirmation**: End-to-end transaction confirmation

## Network Participants

### Banks and Sponsored TPAPs

| Bank Name | IFSC Code | IIN | Port | Sponsored TPAP | Specialty Focus |
|-----------|-----------|-----|------|----------------|-----------------|
| Paisa Vasool Bank | PVB | 321987 | 3004 | BazzarPe | Merchant payments & marketplace solutions |
| Babu Rao Ganpatrao Bank | BRG | 654321 | 3001 | ChillarPay | P2P transfers & micro-payments |
| Chinta Mat Karo Bank | CMK | 456123 | 3003 | *Available* | Worry-free banking solutions |
| Chai Pani Bank | CPB | 789456 | 3002 | *Available* | Micro-transaction specialists |

### Third Party Applications

| TPAP Name | Port | Sponsor PSP | Description |
|-----------|------|-------------|-------------|
| BazzarPe | 6001 | Paisa Vasool Bank | UPI merchant payment solution |
| ChillarPay | 6002 | Chinta Mat Karo Bank | UPI P2P transfer application |

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| NTH Switch | 3005 | National Transaction Hub |
| Redis Stack | 6379/8001 | Shared caching and session management |
| Kafka | 9092 | Message broker for event streaming |
| Zookeeper | 2181 | Kafka cluster coordination |

## Technology Stack

- **Message Broker**: Apache Kafka + Zookeeper
- **Containerization**: Docker & Docker Compose
- **Caching**: Redis Stack
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Bun (Node.js)
- **Language**: TypeScript
- **Framework**: Express.js
- **Testing**: Jest
- **Monitoring**: Grafana + Prometheus (Optional)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gajjar-Mohit/Sampark.git
cd sampark
```

2. Start all services:
```bash
docker-compose up -d
```

3. Verify services are running:
```bash
docker-compose ps
```

### Service URLs

- **NTH Switch**: http://localhost:3005
- **Paisa Vasool Bank**: http://localhost:3004
- **Babu Rao Ganpatrao Bank**: http://localhost:3001
- **Chinta Mat Karo Bank**: http://localhost:3003
- **Chai Pani Bank**: http://localhost:3002
- **BazzarPe**: http://localhost:6001
- **ChillarPay**: http://localhost:6002
- **Redis Insight**: http://localhost:8001

## Project Structure

```
SAMPARK/
├── banks/                    # Payment Service Providers
│   ├── babu-rao-ganpatrao-bank/
│   ├── chai-pani-bank/
│   ├── chinta-mat-karo-bank/
│   └── paisa-vasool-bank/
├── nth/                      # National Transaction Hub
├── tpap/                     # Third Party Applications
│   ├── BazaarPe/
│   └── ChillarPay/
├── k8s/                      # Kubernetes configurations
├── tests/                    # Test suites
├── assets/                   # Static assets
├── docker-compose.yml        # Container orchestration
└── README.md                # This file
```

## Development

### Environment Setup

Each service uses environment variables for configuration. Key variables include:

- `NODE_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `KAFKA_BASEURL`: Kafka broker URL
- `REDIS_URL`: Redis connection string
- `PORT`: Service port

### Database Management

Services use Prisma for database operations:

```bash
# Run migrations
docker-compose exec <service> bun prisma migrate deploy

# Seed data
docker-compose exec <service> bun run seed
```

### Logs and Monitoring

To reduce log noise, most services have logging disabled. Enable logging by removing `logging: driver: "none"` from docker-compose.yml.

## API Documentation

Detailed API documentation is available in each module's README:

- [Banks APIs](./banks/README.md)
- [TPAP APIs](./tpap/README.md)
- [NTH APIs](./nth/README.md)

## Testing

Run tests for specific services:

```bash
# Run all tests
docker-compose exec <service> bun test

# Run with coverage
docker-compose exec <service> bun test --coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is open-source. See LICENSE file for details.

## Disclaimer

This project is for educational and research purposes. It simulates payment system architectures and should not be used in production environments without proper security audits and compliance reviews.