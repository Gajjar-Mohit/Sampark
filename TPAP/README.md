# TPAP Module - Third Party Application Providers

## Overview

The TPAP (Third Party Application Provider) module contains consumer-facing UPI applications that provide payment interfaces to end users. These applications are sponsored by PSP banks and facilitate digital payments through user-friendly interfaces.

## Applications

### 1. BazzarPe (Port: 6001)
- **Sponsor PSP**: Paisa Vasool Bank
- **PSP URL**: `http://paisa-vasool-bank-service:3000/api/v1`
- **Focus**: Merchant payments & marketplace solutions
- **VPA Suffix**: `@pvb`

### 2. ChillarPay (Port: 6002)
- **Sponsor PSP**: Chinta Mat Karo Bank
- **PSP URL**: `http://chinta-mat-karo-service:3000/api/v1`
- **Focus**: P2P transfers & micro-payments
- **VPA Suffix**: `@cmk`

## Architecture

### Technology Stack
- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Integration**: REST API calls to sponsor PSP

### Service Dependencies
- Dedicated PostgreSQL database
- Sponsor PSP bank service
- Docker containerization

## API Endpoints

Both TPAP applications implement similar REST API structures:

### User Management

#### Create User
```http
POST /api/v1/user/create
Content-Type: application/json

{
    "contactNo": "9876543210",
    "name": "John Doe",
    "email": "john.doe@example.com"
}
```

**Response**:
```json
{
    "status": "Success",
    "message": "User created successfully",
    "data": {
        "id": "unique-user-id",
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john.doe@example.com",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
}
```

### Account Management

#### Add Bank Account
```http
POST /api/v1/account/add
Content-Type: application/json

{
    "ifscCode": "BANK123456",
    "contactNo": "9876543210"
}
```

**Response**:
```json
{
    "status": "Success",
    "message": "Account added successfully.",
    "data": {
        "id": "account-uuid",
        "balance": 5000,
        "accountNo": "1234567890",
        "accountHolderName": "John Doe",
        "accountHolderContactNo": "9876543210",
        "ifscCode": "BANK123456",
        "mmid": "mobile-money-id",
        "branchName": "Branch Name",
        "panCardNo": "ABCDE1234F",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "requestedBy": "NTH-to-bank-iin",
        "txnId": "transaction-id",
        "vpa": "9876543210@bankcode"
    }
}
```

### Transaction Management

#### Get All Transactions
```http
POST /api/v1/transaction/all
Content-Type: application/json

{
    "vpa": "user-vpa",
    "userId": "user-id"
}
```

**Response**:
```json
{
    "status": "Success",
    "message": "Transactions fetched successfully.",
    "data": []
}
```

#### Send Money (Push Transaction)
```http
POST /api/v1/transaction/push
Content-Type: application/json

{
    "toVpa": "recipient@bankcode",
    "amount": 100,
    "contactNo": "9876543210"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Transaction completed successfully",
    "data": {
        "senderBank": {
            "accountNo": "sender-account",
            "ifscCode": "SENDER_IFSC",
            "contactNo": "9876543210",
            "name": "Sender Name",
            "vpa": "sender@bankcode",
            "txnId": "unique-transaction-id"
        },
        "beneficiaryBank": {
            "accountNo": "beneficiary-account",
            "ifscCode": "BENEFICIARY_IFSC",
            "contactNo": "recipient-phone",
            "name": "Recipient Name",
            "vpa": "recipient@bankcode",
            "txnId": "unique-transaction-id"
        },
        "txnId": "unique-transaction-id",
        "amount": 100,
        "status": "COMPLETE"
    }
}
```

## Data Models

### User Model
```typescript
{
  id: string              // Unique user identifier
  name: string            // Full name
  phone: string           // Contact number
  email: string           // Email address
  createdAt: Date         // Registration timestamp
  updatedAt: Date         // Last update timestamp
}
```

### Account Model
```typescript
{
  id: string              // Account UUID
  balance: number         // Current balance
  accountNo: string       // Bank account number
  accountHolderName: string
  accountHolderContactNo: string
  ifscCode: string        // Bank IFSC code
  mmid: string            // Mobile Money Identifier
  branchName: string      // Bank branch name
  panCardNo: string       // PAN card number
  vpa: string             // Virtual Payment Address
  createdAt: Date
  updatedAt: Date
  requestedBy: string     // Request origin
  txnId: string           // Transaction ID
}
```

### Transaction Model
```typescript
{
  id: string              // Transaction UUID
  txnId: string           // Unique transaction ID
  amount: number          // Transaction amount
  status: 'PENDING' | 'COMPLETE' | 'FAILED'
  senderVpa: string       // Sender's VPA
  recipientVpa: string    // Recipient's VPA
  createdAt: Date
  updatedAt: Date
}
```

## Database Configuration

Each TPAP has its own PostgreSQL database:

### BazzarPe Database
- **Host**: `bazzar-pe-db`
- **Database**: `bazzar_pe_db`
- **User**: `bazzar_pe_user`
- **Password**: `bazzar_pe_password`

### ChillarPay Database
- **Host**: `chillar-pay-db`
- **Database**: `chillar_pay_db`
- **User**: `chillar_pay_user`
- **Password**: `chillar_pay_password`

## Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PSP_URL=http://sponsor-bank:3000/api/v1
PORT=8000
```

## VPA (Virtual Payment Address) System

### VPA Format
- BazzarPe: `{phone_number}@pvb`
- ChillarPay: `{phone_number}@cmk`

### VPA Resolution
TPAPs resolve VPAs to bank account details through their sponsor PSP banks.

## Payment Flow

### UPI Transaction Process
1. **User Initiation**: User enters recipient VPA and amount
2. **Account Verification**: TPAP verifies user's linked bank account
3. **PSP Communication**: TPAP sends transaction request to sponsor PSP
4. **NTH Routing**: PSP routes transaction through NTH
5. **Destination Processing**: Destination PSP processes the transaction
6. **Status Update**: Transaction status propagated back to TPAP
7. **User Notification**: TPAP notifies user of transaction completion

### Transaction States
- `INITIATED`: Transaction request received
- `PENDING`: Being processed through payment network
- `COMPLETE`: Successfully completed
- `FAILED`: Transaction failed

## Integration with PSP Banks

### API Communication
TPAPs communicate with sponsor PSPs using REST APIs:

#### Account Verification
```javascript
const verifyAccount = async (ifscCode, contactNo) => {
  const response = await fetch(`${PSP_URL}/account/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ifscCode, contactNo })
  });
  return response.json();
};
```

#### Transaction Processing
```javascript
const processTransaction = async (transactionData) => {
  const response = await fetch(`${PSP_URL}/transaction/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData)
  });
  return response.json();
};
```

## Development Setup

### Individual TPAP Development

1. Navigate to TPAP directory:
```bash
cd tpap/{app-name}
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

Start specific TPAP service:
```bash
docker-compose up {app-name}-service
```

View logs:
```bash
docker-compose logs -f {app-name}-service
```

## Testing

Each TPAP includes test suites:

```bash
# Unit tests
bun test

# Integration tests
bun test:integration

# End-to-end tests
bun test:e2e
```

## Security Features

### Input Validation
- Phone number format validation
- Email format validation
- Amount range validation
- VPA format validation

### Transaction Security
- Duplicate transaction prevention
- Rate limiting
- Request sanitization
- Secure headers

### Authentication
- User session management
- API key validation
- Request signing

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

### Common Error Codes
- `INVALID_VPA`: Invalid Virtual Payment Address
- `INSUFFICIENT_BALANCE`: Insufficient account balance
- `TRANSACTION_FAILED`: Transaction processing failed
- `USER_NOT_FOUND`: User account not found
- `ACCOUNT_NOT_LINKED`: No linked bank account

## Monitoring & Analytics

### Transaction Metrics
- Daily transaction volume
- Success/failure rates
- Average transaction amount
- User engagement metrics

### Performance Monitoring
- API response times
- Database query performance
- Error rates
- System resource usage

## User Experience Features

### Real-time Updates
- Transaction status notifications
- Balance updates
- Payment confirmations

### Transaction History
- Chronological transaction list
- Search and filter capabilities
- Export functionality

### Account Management
- Multiple bank account linking
- Account balance display
- Profile management