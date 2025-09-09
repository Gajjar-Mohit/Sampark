# Chai Pani Bank API

A modern banking system API built with Node.js that provides account management and card services.

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Account Management](#account-management)
  - [Card Management](#card-management)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Start the application using Docker Compose
```bash
docker-compose up -d
```

The API will be available at `http://localhost:3002`

## API Endpoints

### Account Management

#### Create New Account

Creates a new bank account for a customer.

**Endpoint:** `POST /api/v1/account/new`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "accountHolderName": "Tony Stark",
    "accountHolderContactNo": "2342344562",
    "panCardNo": "1234567890"
}
```

**Response:**
```json
{
    "status": "Success",
    "message": "Account created successfully",
    "data": {
        "id": "4b9d86f6-104a-4838-858c-801cf21b0bc5",
        "balance": 0,
        "accountNo": "244471121456",
        "accountHolderName": "Tony Stark",
        "accountHolderContactNo": "2342344562",
        "ifscCode": "CPB35432984",
        "branchName": "Garam Gilaas Gate Branch",
        "panCardNo": "1234567890",
        "createdAt": "2025-09-04T12:15:32.288Z",
        "updatedAt": "2025-09-04T12:15:32.288Z"
    }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accountHolderName` | string | Yes | Full name of the account holder |
| `accountHolderContactNo` | string | Yes | Contact number of the account holder |
| `panCardNo` | string | Yes | PAN card number |

### Card Management

#### Create New Card

Creates a new debit or credit card linked to an existing bank account.

**Endpoint:** `POST /api/v1/card/new`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "bankAccountNo": "244471121456",
    "cardType": "CREDIT",
    "provider": "VISA"
}
```

**Response:**
```json
{
    "status": "Success",
    "message": "Card created successfully",
    "data": {
        "id": "b953a588-8d24-46d4-939d-eaa2aa611900",
        "cardNo": "1056321866626273",
        "bankAccountId": "4b9d86f6-104a-4838-858c-801cf21b0bc5",
        "cardType": "DEBIT",
        "status": "ACTIVE",
        "provider": "VISA",
        "pin": "8008",
        "expiryDate": "2030-09-04T13:48:23.617Z",
        "createdAt": "2025-09-04T13:48:23.621Z",
        "updatedAt": "2025-09-04T13:48:23.621Z"
    }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bankAccountNo` | string | Yes | Bank account number to link the card |
| `cardType` | string | Yes | Type of card (DEBIT/CREDIT) |
| `provider` | string | Yes | Card provider (VISA/MASTERCARD) |

#### Update Card PIN

Updates the PIN for an existing card.

**Endpoint:** `PATCH /api/v1/card/pin`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "cardNumber": "1056321866626273",
    "newPin": 1234
}
```

**Response:**
```json
{
    "status": "Success",
    "message": "Card PIN updated successfully",
    "data": {
        "id": "b953a588-8d24-46d4-939d-eaa2aa611900",
        "cardNo": "1056321866626273",
        "bankAccountId": "4b9d86f6-104a-4838-858c-801cf21b0bc5",
        "cardType": "DEBIT",
        "status": "ACTIVE",
        "provider": "VISA",
        "pin": "1234",
        "expiryDate": "2030-09-04T13:48:23.617Z",
        "createdAt": "2025-09-04T13:48:23.621Z",
        "updatedAt": "2025-09-04T13:48:23.621Z"
    }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cardNumber` | string | Yes | Card number to update PIN for |
| `newPin` | number | Yes | New 4-digit PIN |

## Response Format

All API responses follow a consistent structure:

```json
{
    "status": "Success|Error",
    "message": "Human readable message",
    "data": {
        // Response data object
    }
}
```

### Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Error Handling

Error responses include detailed information about what went wrong:

```json
{
    "status": "Error",
    "message": "Detailed error message",
    "error": {
        "code": "ERROR_CODE",
        "details": "Additional error details"
    }
}
```

## Data Models

### Account Model

```json
{
    "id": "UUID",
    "balance": "number",
    "accountNo": "string",
    "accountHolderName": "string",
    "accountHolderContactNo": "string",
    "ifscCode": "string",
    "branchName": "string",
    "panCardNo": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
}
```

### Card Model

```json
{
    "id": "UUID",
    "cardNo": "string",
    "bankAccountId": "UUID",
    "cardType": "DEBIT|CREDIT",
    "status": "ACTIVE|INACTIVE|BLOCKED",
    "provider": "VISA|MASTERCARD",
    "pin": "string",
    "expiryDate": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
}
```

## Environment Configuration

The application runs on port `3002` by default. You can modify the configuration in your `docker-compose.yml` file.

## Security Notes

- PINs are stored securely (consider implementing proper hashing in production)
- All timestamps are in UTC
- Account numbers and card numbers are auto-generated
- IFSC codes follow the bank's internal format

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Chai Pani Bank** - Serving your banking needs with a cup of tea! ☕