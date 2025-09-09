# 🚀 SAMPARK

### Seamless and Modern Payment Architecture for Rapid Transactions

## 🎯 Project Overview

**SAMPARK** is a simulation framework of India’s digital payment ecosystem, developed to help engineers and system architects understand the design principles behind large-scale payment infrastructures. While it does not replicate the exact internal operations of real payment networks, it closely mimics their architectural patterns and event flows to provide a realistic reference model. The project demonstrates how distributed, event-driven, and fault-tolerant systems can be planned when building a payment platform, making it a practical blueprint for engineers exploring financial technology architectures.

### 🎓 Educational Goals

- **Understand Payment Systems**: Learn how national payment infrastructures like UPI, IMPS, and RTGS operate
- **Distributed Architecture**: Implement event-driven microservices using Kafka and containerization
- **Financial Technology**: Explore concepts of interbank settlements, transaction routing, and fraud detection
- **System Design**: Practice building scalable, fault-tolerant distributed systems
- **Regulatory Compliance**: Understand payment system regulations and audit requirements

### 🏗️ System Architecture

![System Architecture](https://github.com/user-attachments/assets/d71e41bc-1f40-4aec-94cb-4049c8a055d5)

SAMPARK implements a multi-layered architecture consisting of:

1. **Central Finance Authority (CFA)** - Regulatory oversight and compliance monitoring
2. **National Transaction Hub (NTH)** - Central payment switch and routing engine
3. **Payment Service Providers (PSPs)** - Banks acting as PSPs for Third Party Applications
4. **Third Party Payment Applications (TPAP)** - Consumer-facing payment apps
5. **Supporting Systems** - Security, fraud detection, and audit systems

### 💳 Payment Flow Architecture

The system follows a realistic payment ecosystem flow:

```
[BazzarPe] → [PSP: Paisa Vasool Bank] → [NTH] → [PSP: Babu Rao Ganpatrao Bank] → [ChillarPay]
```

**Key Components:**
- **Third Party Applications (TPAP)**: BazzarPe, ChillarPay
- **Payment Service Providers**: Banks that sponsor and provide backend services for TPAPs
- **National Transaction Hub**: Central switching and routing system
- **Inter-PSP Communication**: All transactions routed through NTH for interoperability

## 🏦 Current Implementation

### ✅ Completed Components

#### **National Transaction Hub (NTH)**

- **Technology**: Apache Kafka + Docker
- **Architecture**: Event-driven messaging with dedicated topics per PSP
- **PSP Integration**: 4 participating banks with dedicated communication channels
- **Transaction Routing**: Intelligent routing between PSPs based on TPAP mapping

#### **Payment Service Providers (PSPs)**

| Bank Name                   | IFSC Prefix | IIN    | Sponsored TPAP | Specialty                            |
| --------------------------- | ----------- | ------ | -------------- | ------------------------------------ |
| **Paisa Vasool Bank**       | PVB         | 321987 | BazzarPe       | Value-oriented banking & marketplace payments |
| **Babu Rao Ganpatrao Bank** | BRG         | 654321 | ChillarPay     | Traditional banking with modern micro-payments |
| **Chinta Mat Karo Bank**    | CMK         | 456123 | -              | Worry-free banking solutions         |
| **Chai Pani Bank**          | CPB         | 789456 | -              | Micro-payment services               |

#### **Third Party Payment Applications (TPAP)**

| Application Name | PSP Bank                    | Focus Area           |
| ---------------- | --------------------------- | -------------------- |
| **BazzarPe**     | Paisa Vasool Bank (PVB)     | Merchant payments    |
| **ChillarPay**   | Babu Rao Ganpatrao Bank (BRG) | Peer-to-peer transfers |

### 🚧 Planned Components

- [ ] **Central Finance Authority (CFA)** - Regulatory compliance and monitoring
- [ ] **Integrated Payment Gateway (IPG)** - UPI-like real-time payment interface
- [ ] **Instant Funds Relay (IFR)** - IMPS-equivalent 24/7 transfer service
- [ ] **Batch Transfer Network (BTN)** - NEFT-like scheduled batch processing
- [ ] **High-Value Instant Settlement (HVIS)** - RTGS-equivalent for large transactions
- [ ] **Risk Detection Engine (RDE)** - AI/ML-based fraud detection
- [ ] **Unified Data Vault (UDV)** - Comprehensive audit and logging system

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 16+ (for application services)
- Git

### Launch the System

```bash
# Clone the repository
git clone https://github.com/your-org/sampark.git
cd sampark

# Start the NTH infrastructure
cd nth
docker-compose up -d

# Verify system health
docker logs kafka
docker logs zookeeper
```


## 📁 Project Structure

```
sampark/
├── nth/                     # National Transaction Hub (Kafka-based)
│   ├── docker-compose.yml  # Infrastructure setup
│   ├── config/             # Kafka and system configurations
│   └── README.md           # NTH-specific documentation
├── banks/                  # Payment Service Providers
│   ├── paisa-vasool/       # PVB Bank (BazzarPe PSP)
│   ├── babu-rao-ganpatrao/ # BRG Bank (ChillarPay PSP)
│   ├── chinta-mat-karo/    # CMK Bank
│   └── chai-pani/          # CPB Bank
├── tpap/                   # Third Party Payment Applications
│   ├── BazzarPe/           # Merchant payment app
│   └── ChillarPay/         # P2P payment app
└── docs/                   # Documentation
```

## 🔗 System Integration

### Enhanced Transaction Flow

```
[Customer] → [TPAP App] → [PSP Bank] → [NTH] → [Destination PSP] → [Destination TPAP] → [Beneficiary]
     ↓
[Risk Detection] → [Audit Vault] → [CFA Compliance]
```

### Payment Service Provider Model

**PSP-TPAP Relationships:**
- Each TPAP is sponsored by a specific PSP bank
- PSPs handle regulatory compliance and settlement for their TPAPs
- NTH enables interoperability between different PSP networks
- All inter-PSP transactions are routed through the central hub

### Inter-PSP Communication

PSP banks communicate through the NTH using dedicated Kafka topics:

**Primary Communication Channels:**
- **PSP to NTH**: `{PSP-CODE}-to-NTH` (PSP sends to central hub)
- **NTH to PSP**: `NTH-to-{PSP-CODE}` (Hub routes to destination PSP)
- **PSP to TPAP**: `{PSP-CODE}-to-{TPAP}` (PSP communicates with sponsored app)
- **TPAP to PSP**: `{TPAP}-to-{PSP-CODE}` (App sends requests to PSP)

**Example Topics:**
- `PVB-to-NTH`: BazzarPe transactions via Paisa Vasool Bank
- `NTH-to-BRG`: Hub routing to Babu Rao Ganpatrao Bank
- `BRG-to-ChillarPay`: ChillarPay receiving transactions

## 💻 Technology Stack

- **Message Broker**: Apache Kafka with Zookeeper
- **Containerization**: Docker & Docker Compose
- **Backend**: Node.js/Express (individual service choice)
- **Database**: PostgreSQL/MongoDB (per service)
- **Caching**: Redis (where applicable)
- **Monitoring**: Prometheus + Grafana (planned)
- **Security**: JWT tokens, encryption in transit

## 🔐 Security Features

- **End-to-End Encryption**: All inter-service communication encrypted
- **PSP-Level Authentication**: Multi-factor authentication per PSP
- **TPAP Authorization**: Role-based access control for applications
- **Transaction Validation**: PSP-level fraud detection and compliance
- **Audit Trail**: Complete transaction history with immutable logs
- **Regulatory Compliance**: Built-in compliance checking and reporting

## 📖 Documentation

### Component Documentation

- **[NTH Documentation](./nth/README.md)** - National Transaction Hub setup and operations
- **[PSP Documentation](./banks/README.md)** - Payment Service Provider implementations
- **[TPAP Documentation](./tpap/README.md)** - Third Party Application integrations
- **[API Reference](./docs/api.md)** - Complete API documentation
- **[Architecture Guide](./docs/architecture.md)** - System design deep-dive

### Learning Resources

- **[Payment Systems Primer](./docs/payment-systems-101.md)** - Understanding real-world payment systems
- **[PSP Model Guide](./docs/psp-model.md)** - Payment Service Provider architecture
- **[Distributed Systems Concepts](./docs/distributed-systems.md)** - Key concepts implemented
- **[Security Best Practices](./docs/security.md)** - Financial security implementation

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Choose a Component**: Pick from planned components or enhance existing ones
2. **Fork & Branch**: Create a feature branch for your work
3. **Follow Standards**: Adhere to project coding standards and documentation
4. **Test Thoroughly**: Ensure all tests pass and add new ones
5. **Submit PR**: Create detailed pull request with description

### Contribution Areas

- 🏛️ **Regulatory Systems**: Implement CFA compliance monitoring
- 🏦 **PSP Services**: Enhance Payment Service Provider capabilities
- 📱 **TPAP Applications**: Create new Third Party Payment Applications
- 💳 **Payment Gateways**: Build IPG, IFR, BTN, or HVIS systems
- 🔍 **Monitoring**: Develop fraud detection and audit systems
- 📚 **Documentation**: Improve guides and tutorials

## 📊 Project Roadmap

### Phase 1: Foundation (✅ Complete)

- ✅ NTH infrastructure with Kafka
- ✅ Four Payment Service Providers
- ✅ PSP-TPAP relationship mapping
- ✅ Basic transaction routing

### Phase 2: TPAP Applications (🚧 In Progress)

- 🚧 BazzarPe merchant payment application
- 🚧 ChillarPay peer-to-peer payment application
- 📋 PSP-TPAP integration APIs
- 📋 Transaction validation and processing

### Phase 3: Payment Interfaces (📋 Planned)

- 📋 Integrated Payment Gateway (IPG)
- 📋 Instant Funds Relay (IFR)
- 📋 Batch Transfer Network (BTN)
- 📋 High-Value Instant Settlement (HVIS)

### Phase 4: Security & Compliance (📋 Planned)

- 📋 Risk Detection Engine (RDE)
- 📋 Central Finance Authority (CFA)
- 📋 Unified Data Vault (UDV)
- 📋 PSP compliance monitoring

### Phase 5: Advanced Features (💡 Future)

- 💡 Mobile applications
- 💡 Web dashboards
- 💡 Analytics and reporting
- 💡 Load testing and performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<details>
<summary>🏷️ <strong>System Naming Conventions</strong> (Click to expand)</summary>

### Key Regulatory and Oversight Entities

| Real Name                                     | Dummy Name                      | Brief Description                                                                                                                        |
| --------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| RBI (Reserve Bank of India)                   | Central Finance Authority (CFA) | The apex regulatory body overseeing monetary policy, licensing, and compliance. Acts as central node for rules enforcement.            |
| NPCI (National Payments Corporation of India) | National Transaction Hub (NTH)  | Manages retail payment systems and interoperability. Acts as central switch for routing transactions across PSPs.                      |

### Payment Service Providers and Applications

| Real Name                                 | Dummy Name                           | Brief Description                                                                                                                 |
| ----------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| PSP Banks (e.g., Yes Bank, ICICI)         | Paisa Vasool Bank, Babu Rao Bank    | Banks that sponsor and provide backend services for third-party payment applications.                                            |
| Third Party Apps (e.g., Google Pay, Paytm) | BazzarPe, ChillarPay               | Consumer-facing payment applications sponsored by PSP banks for specific use cases.                                              |

### Payment Interfaces and Protocols

| Real Name                                 | Dummy Name                           | Brief Description                                                                                                                 |
| ----------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| UPI (Unified Payments Interface)          | Integrated Payment Gateway (IPG)     | Real-time inter-bank transfer system. API layer for seamless P2P/P2M transactions between TPAPs.                               |
| VPA (Virtual Payment Address)             | Proxy Transaction ID (PTID)          | Unique identifiers hiding actual account details. Enables alias-based addressing in the network.                                |
| IMPS (Immediate Payment Service)          | Instant Funds Relay (IFR)            | 24/7 instant transfers via mobile or account numbers. Handles low-latency, always-on settlements.                               |
| NEFT (National Electronic Funds Transfer) | Batch Transfer Network (BTN)         | Batched electronic transfers settled in cycles. Uses queued processing for non-real-time operations.                            |
| RTGS (Real Time Gross Settlement)         | High-Value Instant Settlement (HVIS) | Real-time settlement for large-value transactions. Focuses on gross individual processing with no netting.                      |

### Supporting Systems and Tools

| Real Name                                                | Dummy Name                            | Brief Description                                                                                                           |
| -------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Payment Apps (Google Pay, PhonePe, Paytm)               | BazzarPe, ChillarPay                 | Third-party applications providing user interfaces for payments, each sponsored by specific PSP banks.                    |
| Anti-Fraud Monitoring (AI/ML in NPCI)                   | Risk Detection Engine (RDE)          | Real-time anomaly detection using mock ML models for pattern recognition in transaction flows.                            |
| Central Repository (for logs/audits)                     | Unified Data Vault (UDV)             | Centralized database for transaction history and compliance data with auditing capabilities.                              |

_These dummy names represent a realistic PSP-based payment ecosystem where banks sponsor third-party applications and all inter-PSP transactions are routed through a central hub for interoperability and compliance._

</details>

---

**🚀 SAMPARK - Building tomorrow's payment systems today!**

_Experience the complete payment ecosystem from TPAP applications through PSP banks to central switching - all in one comprehensive simulation._