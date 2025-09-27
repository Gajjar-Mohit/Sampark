# Banks Module - Payment Service Providers (PSPs)

## Overview

The Banks module contains four Payment Service Provider (PSP) implementations that simulate real banking services in the SAMPARK ecosystem. Each bank provides core banking functionality including account management, card services, and payment processing.

## Bank Services

### 1. Paisa Vasool Bank (Port: 3004)
- **IIN**: 321987
- **IFSC Prefix**: PVB
- **Sponsored TPAP**: BazzarPe
- **Specialty**: Merchant payments & marketplace solutions
- **Branch**: Thoda Aur Refill Branch

### 2. Babu Rao Ganpatrao Bank (Port: 3001)
- **IIN**: 654321
- **IFSC Prefix**: BRG
- **Sponsored TPAP**: ChillarPay
- **Specialty**: P2P transfers & micro-payments
- **Branch**: Hera Pheri Main Branch

### 3. Chinta Mat Karo Bank (Port: 3003)
- **IIN**: 456123
- **IFSC Prefix**: CMK
- **Sponsored TPAP**: Available for sponsorship
- **Specialty**: Worry-free banking solutions

### 4. Chai Pani Bank (Port: 3002)
- **IIN**: 789456
- **IFSC Prefix**: CPB
- **Sponsored TPAP**: Available for sponsorship
- **Specialty**: Micro-transaction specialists

## Common Architecture

Each bank service follows a standardized architecture:

### Technology Stack
- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis Stack
- **Messaging**: Kafka integration

### Service Dependencies
- PostgreSQL database (dedicated per bank)
- Redis Stack instance (dedicated per bank)
- Kafka cluster (shared)
- NTH service (for inter-bank transactions)

## API Endpoints

All banks implement the same REST API structure:

### Account Management

#### Create New Account
```http
POST /api/v1/account/new
Content-Type: application/json

{
    "accountHolderName": "John Doe",
    "accountHolderContactNo": "9876543210",
    "panCardNo": "ABCDE1234F"
}
```

**Response**:
```json
{
    "status": "Success",
    "message": "Account created successfully",
    "data": {
        "id": "uuid",
        "balance": 0,
        "accountNo": "generated-account-number",
        "accountHolderName": "John Doe",
        "accountHolderContactNo": "9876543210",
        "ifscCode": "bank-specific-ifsc",
        "branchName": "bank-specific-branch",
        "panCardNo": "ABCDE1234F",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
}
```

### Card Management

#### Create New Card
```http
POST /api/v1/card/new
Content-Type: application/json

{
    "bankAccountNo": "account-number",
    "cardType": "DEBIT|CREDIT",
    "provider": "VISA|MASTERCARD"
}
```

#### Update Card PIN
```http
PATCH /api/v1/card/pin
Content-Type: application/json

{
    "cardNumber": "card-number",
    "newPin": 1234
}
```

## Data Models

### Account Model
```typescript
{
  id: string              // UUID
  balance: number         // Current balance
  accountNo: string       // Unique account number
  accountHolderName: string
  accountHolderContactNo: string
  ifscCode: string        // Bank-specific IFSC
  branchName: string      // Bank-specific branch
  panCardNo: string       // PAN card number
  createdAt: Date
  updatedAt: Date
}
```

### Card Model
```typescript
{
  id: string              // UUID
  cardNo: string          // Unique card number
  bankAccountId: string   // Reference to account
  cardType: 'DEBIT' | 'CREDIT'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  provider: 'VISA' | 'MASTERCARD'
  pin: string             // Encrypted PIN
  expiryDate: Date        // Card expiry
  createdAt: Date
  updatedAt: Date
}
```

## Database Configuration

Each bank has its own PostgreSQL database:

### Connection Details
- **Host**: `{bank-name}-db`
- **Port**: 5432
- **Database**: `{bank_name}_db`
- **User**: `{bank_name}_user`
- **Password**: `{bank_name}_password`

### Prisma Commands
```bash
# Deploy migrations
bun prisma migrate deploy

# Generate client
bun prisma generate

# Seed database
bun run seed
```

## Redis Configuration

Each bank has a dedicated Redis instance:

### Connection Details
- **Host**: `{bank-name}-redis-stack`
- **Port**: 6379 (internal), mapped to unique external ports
- **Web UI**: Available on mapped port + 1

### Usage
- Session management
- Transaction caching
- Rate limiting
- Temporary data storage

## Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
KAFKA_BASEURL=kafka:9092
REDIS_URL=redis://redis-host:6379
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
IIN=bank-specific-iin
```

## Development Setup

### Individual Bank Development

1. Navigate to bank directory:
```bash
cd banks/{bank-name}
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
bun prisma migrate dev
```

5. Start development server:
```bash
bun run dev
```

### Docker Development

Start specific bank service:
```bash
docker-compose up {bank-name}-service
```

View logs:
```bash
docker-compose logs -f {bank-name}-service
```

## Integration with NTH

Banks integrate with the National Transaction Hub for:

- Inter-bank fund transfers
- Transaction routing
- Settlement processing
- Status notifications

### Kafka Topics
- `bank.{bank-name}.transactions.outbound`
- `bank.{bank-name}.transactions.inbound`
- `bank.{bank-name}.settlements`

## Testing

Each bank includes comprehensive test suites:

```bash
# Unit tests
bun test

# Integration tests
bun test:integration

# API tests
bun test:api
```

## Monitoring & Observability

### Health Checks
Each bank exposes health check endpoints:
```http
GET /health
```

### Metrics
Integration with Prometheus for monitoring:
- Transaction volumes
- Response times
- Error rates
- Database connections

## Security Features

- Input validation and sanitization
- Rate limiting
- PIN encryption
- Secure headers
- CORS configuration
- Request logging

## Error Handling

Standardized error responses:
```json
{
    "status": "Error",
    "message": "Human readable message",
    "error": {
        "code": "ERROR_CODE",
        "details": "Additional details"
    }
}
```

## Performance Optimization

- Redis caching for frequent queries
- Database connection pooling
- Optimized Prisma queries
- Async processing for non-critical operations