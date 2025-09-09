# NTH - National Transaction Hub

#### Central Payment Switch for SAMPARK Payment Architecture

## 🏛️ Overview

The **National Transaction Hub (NTH)** serves as the central switching and routing infrastructure for the SAMPARK payment ecosystem. Acting as the dummy equivalent of NPCI (National Payments Corporation of India), NTH manages retail payment systems and ensures seamless interoperability between participating banks.

## 🚀 Architecture

### System Design
NTH implements a Kafka-based event-driven architecture that ensures:
- **High Availability**: Distributed messaging with fault tolerance
- **Scalability**: Event-driven processing with consumer groups
- **Real-time Processing**: Low-latency transaction routing
- **Audit Trail**: Complete transaction logging and monitoring

### Infrastructure Components
- **Apache Kafka**: Message broker for transaction routing
- **Apache Zookeeper**: Cluster coordination and configuration management
- **Docker**: Containerized deployment for easy scaling

## 🏦 Registered Banks

NTH currently supports 4 participating banks with dedicated Kafka topics and consumer groups:

| Bank Name | IFSC Prefix | IIN | Bank→NTH Topic | NTH→Bank Topic |
|-----------|-------------|-----|----------------|----------------|
| Chinta Mat Karo Bank | CMK | 456123 | `456123-to-NTH` | `NTH-to-456123` |
| Chai Pani Bank | CPB | 789456 | `789456-to-NTH` | `NTH-to-789456` |
| Paisa Vasool Bank | PVB | 321987 | `321987-to-NTH` | `NTH-to-321987` |
| Babu Rao Ganpatrao Bank | BRG | 654321 | `654321-to-NTH` | `NTH-to-654321` |

### Kafka Topic Architecture

#### **8 Topics Configuration**:
- **4 Bank-to-NTH Topics**: Incoming transaction requests from banks
- **4 NTH-to-Bank Topics**: Outgoing responses and settlements to banks

#### **8 Consumer Groups**:
- **4 Bank-to-NTH Groups**: Process incoming transactions with dedicated consumers
- **4 NTH-to-Bank Groups**: Handle outbound transaction routing

## 🔄 Transaction Flow

```
[Bank A] → [456123-to-NTH Topic] → [NTH Router] → [NTH-to-789456 Topic] → [Bank B]
```

1. **Transaction Initiation**: Source bank publishes transaction to `{IIN}-to-NTH` topic
2. **NTH Processing**: Central router validates, processes, and determines destination
3. **Transaction Routing**: NTH publishes to destination `NTH-to-{IIN}` topic
4. **Bank Settlement**: Destination bank consumes and processes transaction
5. **Response Flow**: Acknowledgments flow back through reverse path

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Network access to `192.168.1.5` (or update `KAFKA_ADVERTISED_LISTENERS`)

### Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd nth-payment-hub
```

2. **Start Infrastructure**
```bash
docker-compose up -d
```

3. **Verify Services**
```bash
# Check Zookeeper
docker logs zookeeper

# Check Kafka
docker logs kafka

# Verify Kafka Topics (after application starts)
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Configuration

The system auto-creates the following Kafka topics:
- `456123-to-NTH` / `NTH-to-456123` (Chinta Mat Karo Bank)
- `789456-to-NTH` / `NTH-to-789456` (Chai Pani Bank)
- `321987-to-NTH` / `NTH-to-321987` (Paisa Vasool Bank)
- `654321-to-NTH` / `NTH-to-654321` (Babu Rao Ganpatrao Bank)

## 📊 System Configuration

### Docker Compose Services

#### Zookeeper
- **Port**: 2181
- **Purpose**: Kafka cluster coordination
- **Configuration**: Single-node setup for development

#### Kafka Broker
- **Port**: 9092
- **Advertised Listener**: `192.168.1.5:9092`
- **Replication Factor**: 1 (development setup)
- **Log Retention**: 7 days (168 hours)
- **Segment Size**: 1GB

### Network Architecture
- **Network**: `kafka-network` (bridge driver)
- **Inter-service Communication**: Docker internal networking
- **External Access**: Host network binding on configured IP

## 🔐 Security & Compliance

### Transaction Security
- **Message Encryption**: In-transit encryption for sensitive data
- **Authentication**: IIN-based bank identification
- **Authorization**: Topic-level access control per bank
- **Audit Logging**: Complete transaction trail in Kafka logs

### Regulatory Compliance
- **Transaction Limits**: Configurable per bank and transaction type
- **Settlement Windows**: Real-time and batch processing modes
- **Fraud Detection**: Pattern analysis on transaction flows
- **Reporting**: Automated compliance reporting generation

## 📈 Monitoring & Operations

### Health Checks
```bash
# Check Kafka cluster health
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Monitor topic lag
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups
```

### Scaling Considerations
- **Horizontal Scaling**: Add Kafka brokers for increased throughput
- **Topic Partitioning**: Partition topics by transaction volume
- **Consumer Scaling**: Scale consumer groups based on processing load
- **Database Integration**: Add persistent storage for transaction history

## 🔧 Development

### Adding New Banks
1. **Update Bank Registry**:
```javascript
const newBank = {
  ifscCodePrefix: "NEW",
  iin: "123456",
  bankToNTH: "123456-to-NTH",
  nthToBank: "NTH-to-123456",
  nthToBankGroup: "NTH-to-123456-group",
  bankToNTHGroup: "123456-to-NTH-group",
  name: "New Bank Name",
};
```

2. **Create Kafka Topics**: Topics are auto-created or can be pre-created
3. **Deploy Consumer Groups**: Update consumer group configurations
4. **Update Routing Logic**: Add bank-specific routing rules

### Testing
```bash
# Send test message to bank topic
docker exec kafka kafka-console-producer --bootstrap-server localhost:9092 --topic 456123-to-NTH

# Consume messages from NTH topic
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic NTH-to-456123 --from-beginning
```

## 🔗 Integration

### Bank API Integration
Each participating bank must implement:
- **Message Producer**: Publish to `{IIN}-to-NTH` topic
- **Message Consumer**: Subscribe to `NTH-to-{IIN}` topic
- **Transaction Handler**: Process incoming transaction messages
- **Response Handler**: Send acknowledgments and status updates

### Message Format
```json
{
  "transactionId": "TXN123456789",
  "sourceIIN": "456123",
  "destinationIIN": "789456",
  "amount": 1000.00,
  "currency": "INR",
  "timestamp": "2024-01-01T10:00:00Z",
  "transactionType": "P2P",
  "metadata": {}
}
```

## 📚 Related Documentation

- **[SAMPARK Main Documentation](https://sampark.gitbook.io/sampark-docs/)**: Complete system overview
- **[Bank Integration Guides](https://sampark.gitbook.io/sampark-docs/banks)**: Bank-specific implementation details
- **[API Reference](https://sampark.gitbook.io/sampark-docs/api)**: Complete API documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Create Pull Request

## 📄 License

This project is part of the SAMPARK payment ecosystem. Please refer to the main project license for usage terms.

## 🆘 Support

For technical support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to the [SAMPARK Documentation](https://sampark.gitbook.io/sampark-docs/)

---

**NTH - Enabling seamless inter-bank transactions for the SAMPARK ecosystem** 🚀