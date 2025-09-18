import { de } from "zod/locales";
import { kafka } from "..";
import {
  MessageType,
  type VerifyDetailsRequest,
  type TransferDetails,
} from "../types/imps";
import { getAccountByContactNo } from "./account.service";
import { creditBankAccount, debitBankAccount } from "./imps.service";
import { saveLog } from "./logging.service";
import { storeTransaction } from "./transaction.service";

const IIN = process.env.IIN;
const GROUP_ID = `NTH-to${IIN}-group`;
const RECEIVE_TOPIC = `NTH-to-${IIN}`;
const SEND_TOPIC = `${IIN}-to-NTH`;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timestamp: number;
}

class IMPSKafkaService {
  private consumer = kafka.consumer({ groupId: GROUP_ID });
  private producer = kafka.producer();
  private isConnected = false;
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly TIMEOUT_MS = 30000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    try {
      await Promise.all([this.consumer.connect(), this.producer.connect()]);

      await this.consumer.subscribe({
        topics: [RECEIVE_TOPIC],
      });

      this.isConnected = true;
      console.log(`Kafka service initialized for IIN: ${IIN}`);

      // Start cleanup interval once
      this.startCleanupInterval();
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error);
      throw error;
    }
  }

  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up expired requests
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [txnId, request] of this.pendingRequests.entries()) {
        if (now - request.timestamp > this.TIMEOUT_MS) {
          this.pendingRequests.delete(txnId);
          request.reject(new Error("Request timeout"));
        }
      }
    }, 5000); // Check every 5 seconds
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
      case MessageType.IMPS_TRANSFER_COMPLETE:
        await this.handleIMPSTranferComplete(value);
        break;
      default:
        console.warn(`Unknown message type: ${key}`);
        await this.sendNotFoundResponse();
    }
  }

  private async handleIMPSTranferComplete(value: string): Promise<void> {
    try {
      const details = JSON.parse(value);
      console.log("Handling IMPS transfer complete", details);

      await saveLog({
        transactionId: details.txnId,
        data: {
          mode: "IMPS",
          amount: details.amount,
          status: "COMPLETE",
          reasonOfFailure: "",
          remitterAccount: {
            accountNo: details.remitterDetails.accountNo,
            ifscCode: details.remitterDetails.ifscCode,
            contactNo: details.remitterDetails.contactNo,
            mmid: details.remitterDetails.mmid,
          },
          beneficiaryAccount: {
            accountNo: details.beneficiaryDetails.accountNo,
            ifscCode: details.beneficiaryDetails.ifscCode,
            contactNo: details.beneficiaryDetails.contactNo,
            mmid: details.beneficiaryDetails.mmid,
          },
        },
      });

      // Check if there's a pending request for this transaction
      if (details.txnId && this.pendingRequests.has(details.txnId)) {
        const pendingRequest = this.pendingRequests.get(details.txnId)!;
        this.pendingRequests.delete(details.txnId);

        // Resolve the promise with the complete transfer details
        pendingRequest.resolve({
          ...details,
          status: "COMPLETE",
        });
      }
    } catch (error) {
      console.error("Error handling IMPS transfer complete:", error);

      // If parsing failed but we can extract txnId, reject the pending request
      try {
        const details = JSON.parse(value);
        if (details.txnId && this.pendingRequests.has(details.txnId)) {
          const pendingRequest = this.pendingRequests.get(details.txnId)!;
          this.pendingRequests.delete(details.txnId);
          pendingRequest.reject(error);
        }
      } catch (parseError) {
        console.error("Could not parse value for error handling:", parseError);
      }
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
      console.log(data);
      const { remitterDetails, beneficiaryDetails, txnId, amount } = data;
      const parsedAmount = Number.parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.error("Invalid amount for debit request:", amount);
        return;
      }

      const [debitResult, txSaved] = await Promise.all([
        debitBankAccount(
          remitterDetails.accountNo,
          remitterDetails.ifscCode,
          remitterDetails.contactNo,
          parsedAmount
        ),
        storeTransaction(
          txnId,
          parsedAmount,
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

      const { remitterDetails, beneficiaryDetails, txnId, amount } = data;
      const parsedAmount = Number.parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.error("Invalid amount for credit request:", amount);
        return;
      }

      const [creditResult, txSaved] = await Promise.all([
        creditBankAccount(
          beneficiaryDetails.accountNo,
          beneficiaryDetails.ifscCode,
          beneficiaryDetails.contactNo,
          parsedAmount
        ),
        storeTransaction(
          txnId,
          parsedAmount,
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

  // Updated method that returns a Promise and waits for completion
  async initiateIMPSTransfer(details: TransferDetails): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      // Save initial log
      if (details.remitterDetails && details.beneficiaryDetails) {
        await saveLog({
          transactionId: details.txnId,
          data: {
            mode: "IMPS",
            amount: details.amount,
            status: "PENDING",
            reasonOfFailure: "",
            remitterAccount: {
              accountNo: details.remitterDetails.accountNo,
              ifscCode: details.remitterDetails.ifscCode,
              contactNo: details.remitterDetails.contactNo,
              mmid: details.remitterDetails.mmid,
            },
            beneficiaryAccount: {
              accountNo: details.beneficiaryDetails.accountNo,
              ifscCode: details.beneficiaryDetails.ifscCode,
              contactNo: details.beneficiaryDetails.contactNo,
              mmid: details.beneficiaryDetails.mmid,
            },
          },
        });
      }

      // Create promise that will be resolved when IMPS_TRANSFER_COMPLETE is received
      const transferPromise = new Promise((resolve, reject) => {
        // Set timeout
        const timeoutId = setTimeout(() => {
          if (this.pendingRequests.has(details.txnId)) {
            this.pendingRequests.delete(details.txnId);
            reject(
              new Error(
                "IMPS transfer timeout - no completion response received"
              )
            );
          }
        }, this.TIMEOUT_MS);

        this.pendingRequests.set(details.txnId, {
          resolve: (value) => {
            clearTimeout(timeoutId);
            resolve(value);
          },
          reject: (reason) => {
            clearTimeout(timeoutId);
            reject(reason);
          },
          timestamp: Date.now(),
        });
      });

      // Send the transfer request
      await this.sendResponse(
        MessageType.IMPS_TRANSFER,
        JSON.stringify(details)
      );

      console.log("IMPS transfer initiated, waiting for completion...");

      // Return the promise that will resolve when transfer completes
      return await transferPromise;
    } catch (error) {
      console.error("Error initiating IMPS transfer:", error);

      // Clean up pending request if it exists
      if (details.txnId && this.pendingRequests.has(details.txnId)) {
        this.pendingRequests.delete(details.txnId);
      }

      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Clear cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // Reject all pending requests
      for (const [txnId, request] of this.pendingRequests.entries()) {
        request.reject(new Error("Service disconnected"));
      }
      this.pendingRequests.clear();

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

let impsKafkaService: IMPSKafkaService;

function getIMPSKafkaService(): IMPSKafkaService {
  if (!impsKafkaService) {
    impsKafkaService = new IMPSKafkaService();
  }
  return impsKafkaService;
}

export const listernForNTH = () => getIMPSKafkaService().listenForNTH();

// Updated export that returns a Promise
export const initiateIMPSTransfer = (details: TransferDetails): Promise<any> =>
  getIMPSKafkaService().initiateIMPSTransfer(details);

export default getIMPSKafkaService;
