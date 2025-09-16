import { kafka } from "..";
import { getAccountByContactNo } from "./account.service";
import { creditBankAccount, debitBankAccount } from "./imps.service";
import { storeTransaction } from "./transaction.service";

// Constants
const IIN = "654321";
const GROUP_ID = `NTH-to${IIN}-group`;
const RECEIVE_TOPIC = `NTH-to-${IIN}`;
const SEND_TOPIC = `${IIN}-to-NTH`;

// Message types enum for better type safety
enum MessageType {
  VERIFY_DETAILS = "imps-transfer-verify-details",
  DEBIT_REMITTER = "imps-transfer-debit-remitter",
  CREDIT_BENEFICIARY = "imps-transfer-credit-beneficiary",
  DEBIT_SUCCESS = "imps-transfer-debit-remitter-success",
  CREDIT_SUCCESS = "imps-transfer-credit-benificiary-success",
  VERIFIED_DETAILS = "imps-transfer-verified-details",
  ACCOUNT_DETAILS = "account-details",
  IMPS_TRANSFER = "imps-transfer",
}

// Interfaces for better type safety
interface RemitterDetails {
  accountNo: string;
  ifscCode: string;
  contactNo: string;
  amount: string;
}

interface BeneficiaryDetails {
  accountNo: string;
  ifscCode: string;
  contactNo: string;
}

interface TransferDetails {
  remitterDetails: RemitterDetails;
  beneficiaryDetails: BeneficiaryDetails;
  txnId: string;
}

interface VerifyDetailsRequest {
  accountNo: string;
  ifscCode: string;
  requestedBy: string;
  txnId: string;
}

class IMPSKafkaService {
  private consumer = kafka.consumer({ groupId: GROUP_ID });
  private producer = kafka.producer();
  private isConnected = false;

  async initialize(): Promise<void> {
    try {
      await Promise.all([this.consumer.connect(), this.producer.connect()]);

      await this.consumer.subscribe({
        topics: [RECEIVE_TOPIC],
      });

      this.isConnected = true;
      console.log(`Kafka service initialized for IIN: ${IIN}`);
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error);
      throw error;
    }
  }

  async listenForNTH(): Promise<void> {
    if (!this.isConnected) {
      await this.initialize();
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat }) => {
        try {
          await this.processMessage(message);
        } catch (error) {
          console.error("Error processing message:", error);
          await this.sendNotFoundResponse();
        }
      },
    });
  }

  private async processMessage(message: any): Promise<void> {
    const key = message.key?.toString();
    const value = message.value?.toString();

    if (!key || !value) {
      console.warn("Invalid message received - missing key or value");
      await this.sendNotFoundResponse();
      return;
    }

    console.log(`Processing message - Key: ${key}`);

    switch (key) {
      case MessageType.VERIFY_DETAILS:
        await this.handleVerifyDetails(value);
        break;
      case MessageType.DEBIT_REMITTER:
        await this.handleDebitRequest(value);
        break;
      case MessageType.CREDIT_BENEFICIARY:
        await this.handleCreditRequest(value);
        break;
      default:
        console.warn(`Unknown message type: ${key}`);
        await this.sendNotFoundResponse();
    }
  }

  private async handleVerifyDetails(value: string): Promise<void> {
    try {
      const details: VerifyDetailsRequest = JSON.parse(value);
      const account = await getAccountByContactNo(
        details.accountNo,
        details.ifscCode,
        details.requestedBy,
        details.txnId
      );

      if (!account) {
        await this.sendNotFoundResponse();
        return;
      }

      await this.sendResponse(
        MessageType.VERIFIED_DETAILS,
        JSON.stringify(account)
      );
    } catch (error) {
      console.error("Error handling verify details:", error);
      await this.sendNotFoundResponse();
    }
  }

  private async handleDebitRequest(value: string): Promise<void> {
    try {
      const data: TransferDetails = JSON.parse(value);
      const { remitterDetails, beneficiaryDetails, txnId } = data;
      const amount = Number.parseFloat(remitterDetails.amount);

      if (isNaN(amount) || amount <= 0) {
        console.error(
          "Invalid amount for debit request:",
          remitterDetails.amount
        );
        return;
      }

      const [debitResult, txSaved] = await Promise.all([
        debitBankAccount(
          remitterDetails.accountNo,
          remitterDetails.ifscCode,
          remitterDetails.contactNo,
          amount
        ),
        storeTransaction(
          txnId,
          amount,
          "DEBIT",
          remitterDetails.accountNo,
          `IMPS/${beneficiaryDetails.accountNo}`
        ),
      ]);

      console.log("Transaction saved:", txSaved);

      if (!debitResult.success) {
        console.error("Error debiting bank account:", debitResult);
        return;
      }

      await this.sendResponse(MessageType.DEBIT_SUCCESS, value);
    } catch (error) {
      console.error("Error handling debit request:", error);
    }
  }

  private async handleCreditRequest(value: string): Promise<void> {
    try {
      const data: TransferDetails = JSON.parse(value);
      const { remitterDetails, beneficiaryDetails, txnId } = data;
      const amount = Number.parseFloat(remitterDetails.amount);

      if (isNaN(amount) || amount <= 0) {
        console.error(
          "Invalid amount for credit request:",
          remitterDetails.amount
        );
        return;
      }

      const [creditResult, txSaved] = await Promise.all([
        creditBankAccount(
          beneficiaryDetails.accountNo,
          beneficiaryDetails.ifscCode,
          beneficiaryDetails.contactNo,
          amount
        ),
        storeTransaction(
          txnId,
          amount,
          "CREDIT",
          beneficiaryDetails.accountNo,
          `IMPS/${remitterDetails.accountNo}`
        ),
      ]);

      console.log("Transaction saved:", txSaved);

      if (!creditResult.success) {
        console.error("Error crediting bank account:", creditResult);
        return;
      }

      await this.sendResponse(MessageType.CREDIT_SUCCESS, value);
    } catch (error) {
      console.error("Error handling credit request:", error);
    }
  }

  private async sendResponse(key: string, value: string): Promise<void> {
    try {
      await this.producer.send({
        topic: SEND_TOPIC,
        messages: [
          {
            key,
            value,
          },
        ],
      });
      console.log(`Response sent - Key: ${key}`);
    } catch (error) {
      console.error("Error sending response:", error);
      throw error;
    }
  }

  private async sendNotFoundResponse(): Promise<void> {
    await this.sendResponse(MessageType.ACCOUNT_DETAILS, "Not Found");
  }

  async initiateIMPSTransfer(details: TransferDetails): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      await this.sendResponse(
        MessageType.IMPS_TRANSFER,
        JSON.stringify(details)
      );
      console.log("IMPS transfer initiated successfully");
    } catch (error) {
      console.error("Error initiating IMPS transfer:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.consumer.disconnect(),
        this.producer.disconnect(),
      ]);
      this.isConnected = false;
      console.log("Kafka service disconnected");
    } catch (error) {
      console.error("Error disconnecting Kafka service:", error);
    }
  }
}

// Lazy singleton initialization
let impsKafkaService: IMPSKafkaService;

function getIMPSKafkaService(): IMPSKafkaService {
  if (!impsKafkaService) {
    impsKafkaService = new IMPSKafkaService();
  }
  return impsKafkaService;
}

export const listernForNTH = () => getIMPSKafkaService().listenForNTH();
export const initiateIMPSTransfer = (details: TransferDetails) => 
  getIMPSKafkaService().initiateIMPSTransfer(details);

export default getIMPSKafkaService;