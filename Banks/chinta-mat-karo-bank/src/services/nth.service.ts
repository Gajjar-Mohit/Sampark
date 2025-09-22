import { de } from "zod/locales";
import { kafka } from "..";
import { type VerifyDetailsRequest, type TransferDetails } from "../types/imps";
import { getAccountByContact, getAccountByContactNo } from "./account.service";
import { creditBankAccount, debitBankAccount } from "./imps.service";
import { saveLog } from "./logging.service";
import { storeTransaction } from "./transaction.service";
import { MessageType } from "../types/nth";
import { createVpaAndLinkAccount, verifyVpaService } from "./upi.service";

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
      //IMPS Transfer
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
      case MessageType.IMPS_TRANSFER_ERROR:
        await this.handleIMPSTranferError(value);
        break;

      //UPI Transfer
      case MessageType.ADD_BANK_DETAILS:
        await this.addBank(value);
        break;
      case MessageType.BANK_DETAILS_ADDED:
        await this.handleBankDetailsAdded(value);
        break;
      case MessageType.VERIFY_TO_VPA:
        await this.handleVerifyToVpa(value);
        break;
      case MessageType.VERIFY_FROM_VPA:
        await this.handleVerifyFromVpa(value);
        break;
      case MessageType.UPI_DEBIT_REMITTER:
        await this.handleUpiDebitRemitter(value);
        break;
      case MessageType.UPI_CREDIT_BENEFICIARY:
        await this.handleUpiCreditBeneficiary(value);
        break;
      default:
        console.warn(`Unknown message type: ${key}`);
        await this.sendNotFoundResponse();
    }
  }

  //   {
  //     "transactionId": "TXN032509211252467",
  //     "data": {
  //         "type": "UPI",
  //         "txnId": "TXN032509211252467",
  //         "toVpa": "2342344562@pvb",
  //         "fromVpa": "2342344562@cmk",
  //         "amount": 19,
  //         "requestedBy": "NTH-to-456123"
  //     },
  //     "beneficiaryBank": {
  //         "accountNo": "348861268832",
  //         "ifscCode": "PVB42245114",
  //         "contactNo": "2342344562",
  //         "name": "Mohit Gajjar",
  //         "vpa": "2342344562@pvb",
  //         "txnId": "TXN032509211252467"
  //     },
  //     "senderBank": {
  //         "accountNo": "348861268832",
  //         "ifscCode": "PVB42245114",
  //         "contactNo": "2342344562",
  //         "name": "Mohit Gajjar",
  //         "vpa": "2342344562@cmk",
  //         "txnId": "TXN032509211252467"
  //     }
  // }

  private async handleUpiDebitRemitter(value: string): Promise<void> {
    console.log("Handling UPI debit remitter", value);
    try {
      const details = JSON.parse(value);
      console.log("Handling UPI debit remitter", details);
      const accountNo = details.senderBank.accountNo;
      const ifscCode = details.senderBank.ifscCode;
      const contactNo = details.senderBank.contactNo;
      const txnId = details.txnId;
      const amount = details.amount;

      const [debitResult, txSaved] = await Promise.all([
        debitBankAccount(accountNo, ifscCode, contactNo, amount),
        storeTransaction(txnId, amount, "DEBIT", accountNo, `UPI/${contactNo}`),
      ]);

      console.log("Transaction saved:", txSaved);

      if (!debitResult.success) {
        console.error("Error debiting bank account:", debitResult);
        return;
      }

      await this.sendToNth(MessageType.UPI_DEBIT_REMITTER_SUCCESS, value);
    } catch (error) {
      console.error("Error handling UPI debit remitter:", error);
    }
  }

  private async handleUpiCreditBeneficiary(value: string): Promise<void> {
    console.log("Handling UPI credit beneficiary", value);
    try {
      const details = JSON.parse(value);
      console.log("Handling UPI credit beneficiary", details);
      const accountNo = details.beneficiaryBank.accountNo;
      const ifscCode = details.beneficiaryBank.ifscCode;
      const contactNo = details.beneficiaryBank.contactNo;
      const txnId = details.txnId;
      const amount = details.amount;

      const [creditResult, txSaved] = await Promise.all([
        creditBankAccount(accountNo, ifscCode, contactNo, amount),
        storeTransaction(
          txnId,
          amount,
          "CREDIT",
          accountNo,
          `UPI/${contactNo}`
        ),
      ]);

      console.log("Transaction saved:", txSaved);

      if (!creditResult.success) {
        console.error("Error crediting bank account:", creditResult);
        return;
      }

      await this.sendToNth(MessageType.UPI_CREDIT_BENEFICIARY_SUCCESS, value);
    } catch (error) {
      console.error("Error handling UPI credit beneficiary:", error);
    }
  }

  private async handleVerifyToVpa(value: string): Promise<void> {
    console.log("Handling verify TO vpa", value);
    try {
      const details = JSON.parse(value);
      console.log("Handling verify vpa", details);
      const vpaResult = await verifyVpaService(details.toVpa, details.txnId);

      if (!vpaResult.success) {
        console.error("Error verifying vpa:", vpaResult);
        return;
      }

      await this.sendToNth(
        MessageType.VERIFY_TO_VPA_COMPLETE,
        JSON.stringify({ ...vpaResult.data, txnId: details.txnId })
      );
    } catch (error) {
      console.error("Error handling verify vpa:", error);
      await this.sendNotFoundResponse();
    }
  }

  private async handleVerifyFromVpa(value: string): Promise<void> {
    console.log("Handling verify FROM vpa", value);
    try {
      const details = JSON.parse(value);
      console.log("Handling verify vpa", details);
      const vpaResult = await verifyVpaService(details.fromVpa, details.txnId);

      if (!vpaResult.success) {
        console.error("Error verifying vpa:", vpaResult);
        return;
      }

      await this.sendToNth(
        MessageType.VERIFY_FROM_VPA_COMPLETE,
        JSON.stringify({ ...vpaResult.data, txnId: details.txnId })
      );
    } catch (error) {
      console.error("Error handling verify vpa:", error);
      await this.sendNotFoundResponse();
    }
  }

  private async handleIMPSTranferError(value: string): Promise<void> {
    try {
      const details = JSON.parse(value);
      console.log("Handling IMPS transfer error", details);
      await saveLog({
        transactionId: details.txnId,
        data: {
          mode: "IMPS",
          amount: details.amount,
          status: "ERROR",
          reasonOfFailure: details,
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
        pendingRequest.reject(new Error(details.reasonOfFailure));
      }
    } catch (error) {
      console.error("Error handling IMPS transfer error:", error);

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

      await this.sendToNth(
        MessageType.VERIFIED_DETAILS,
        JSON.stringify(account)
      );
    } catch (error) {
      console.error("Error handling verify details:", error);
      await this.sendNotFoundResponse();
    }
  }

  private async handleBankDetailsAdded(value: string): Promise<void> {
    try {
      const details = JSON.parse(value);
      // Check if there's a pending request for this transaction
      if (details.txnId && this.pendingRequests.has(details.txnId)) {
        const pendingRequest = this.pendingRequests.get(details.txnId)!;
        this.pendingRequests.delete(details.txnId);
        const res = await createVpaAndLinkAccount(details);
        // Resolve the promise with the complete transfer details
        pendingRequest.resolve({
          ...res,
        });
      }
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error);
      throw error;
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

      await this.sendToNth(MessageType.DEBIT_SUCCESS, value);
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

      await this.sendToNth(MessageType.CREDIT_SUCCESS, value);
    } catch (error) {
      console.error("Error handling credit request:", error);
    }
  }

  private async sendToNth(key: string, value: string): Promise<void> {
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
    await this.sendToNth(MessageType.ACCOUNT_DETAILS, "Not Found");
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
      await this.sendToNth(MessageType.IMPS_TRANSFER, JSON.stringify(details));

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

  async initAddBank(contactNo: string, ifscCode: string, txnId: string) {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const transferPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (this.pendingRequests.has(txnId)) {
            this.pendingRequests.delete(txnId);
            reject(
              new Error(
                "IMPS transfer timeout - no completion response received"
              )
            );
          }
        }, this.TIMEOUT_MS);

        this.pendingRequests.set(txnId, {
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

      await this.sendToNth(
        MessageType.ADD_BANK_DETAILS,
        JSON.stringify({
          txnId,
          contactNo,
          ifscCode,
          requestedBy: RECEIVE_TOPIC,
        })
      );

      console.log("Bank details verification, waiting for completion...");

      // Return the promise that will resolve when transfer completes
      return await transferPromise;
    } catch (error) {
      console.error("Error initiating IMPS transfer:", error);

      // Clean up pending request if it exists
      if (txnId && this.pendingRequests.has(txnId)) {
        this.pendingRequests.delete(txnId);
      }

      throw error;
    }
  }

  async initPushTransaction(
    toVpa: string,
    fromVpa: string,
    amount: number,
    txnId: string
  ) {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const transferPromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (this.pendingRequests.has(txnId)) {
            this.pendingRequests.delete(txnId);
            reject(
              new Error(
                "IMPS transfer timeout - no completion response received"
              )
            );
          }
        }, this.TIMEOUT_MS);

        this.pendingRequests.set(txnId, {
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

      await this.sendToNth(
        MessageType.INIT_PUSH_TRANSACTION,
        JSON.stringify({
          txnId,
          toVpa,
          fromVpa,
          amount,
          requestedBy: RECEIVE_TOPIC,
        })
      );

      console.log("Bank details verification, waiting for completion...");

      // Return the promise that will resolve when transfer completes
      return await transferPromise;
    } catch (error) {
      console.error("Error initiating IMPS transfer:", error);

      // Clean up pending request if it exists
      if (txnId && this.pendingRequests.has(txnId)) {
        this.pendingRequests.delete(txnId);
      }

      throw error;
    }
  }

  async addBank(value: string) {
    try {
      const data = JSON.parse(value);
      console.log(data);
      const { txnId, contactNo, ifscCode, requestedBy } = data;
      console.log("Adding bank details");

      if (!contactNo || !ifscCode || !txnId) {
        const key = "upi-bank-details-adding-error";
        const value = "Missing contact number or IFSC code or TXN ID";
        await this.sendToNth(key, value);
        return;
      }

      const bankAccount = await getAccountByContact(
        contactNo,
        ifscCode,
        requestedBy,
        txnId
      );

      if (!bankAccount) {
        const key = "upi-bank-details-adding-error";
        const value = "Bank account not found";
        await this.sendToNth(key, value);
        return;
      }

      await this.sendToNth(
        MessageType.BANK_DETAILS_ADDED,
        JSON.stringify({
          ...bankAccount,
        })
      );
    } catch (error) {
      console.error("Failed to initialize Kafka service:", error);
      throw error;
    }
    // Save initial log
    // if (contactNo && ifscCode && txnId) {
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

export const linkBankDetails = (
  contactNo: string,
  ifscCode: string,
  txnId: string
) => getIMPSKafkaService().initAddBank(contactNo, ifscCode, txnId);

export const pushTransaction = (
  toVpa: string,
  fromVpa: string,
  amount: number,
  txnId: string
) => getIMPSKafkaService().initPushTransaction(toVpa, fromVpa, amount, txnId);

export default getIMPSKafkaService;
