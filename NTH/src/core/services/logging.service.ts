import { redisClient } from "../..";

// Save remitter data - creates new transaction state or updates existing one
export const saveRemitter = async (
  transactionId: string,
  remitterData: any,
  amount: string
) => {
  console.log(`Storing remitter data for transaction: ${transactionId}`);

  try {
    // Check if transaction state already exists
    const existingState = await redisClient.get(transactionId);
    let txState: any;

    if (existingState) {
      // Parse existing state and update remitter data
      txState = JSON.parse(existingState);
      txState.remitterBank = remitterData;
      txState.amount = amount;
      console.log("Updated existing transaction with remitter data");
    } else {
      // Create new transaction state with remitter data
      txState = {
        transactionId: transactionId,
        amount,
        remitterBank: remitterData,
      };
      console.log("Created new transaction state with remitter data");
    }

    // Save updated state to Redis
    await redisClient.set(transactionId, JSON.stringify(txState));
    console.log("Remitter data saved successfully");

    return txState;
  } catch (error) {
    console.error("Error saving remitter data:", error);
    throw error;
  }
};

// Save beneficiary data - updates existing transaction state
export const saveBeneficiary = async (
  transactionId: string,
  beneficiaryData: any,
  amount?: string
) => {
  console.log(`Storing beneficiary data for transaction: ${transactionId}`);

  try {
    // Get existing transaction state
    const existingState = await redisClient.get(transactionId);

    if (!existingState) {
      console.log(
        "Transaction state not found, creating new state with beneficiary data"
      );
      // If no existing state, create new one with beneficiary data only
      const txState = {
        transactionId: transactionId,
        beneficiaryBank: beneficiaryData,
        amount: amount,
      };
      await redisClient.set(transactionId, JSON.stringify(txState));
      return txState;
    }

    // Parse existing state and add beneficiary data
    const txState = JSON.parse(existingState);
    txState.beneficiaryBank = beneficiaryData;
    if (amount) {
      txState.amount = amount;
    }
    // Save updated state to Redis
    await redisClient.set(transactionId, JSON.stringify(txState));
    console.log("Beneficiary data added to existing transaction");

    return txState;
  } catch (error) {
    console.error("Error saving beneficiary data:", error);
    throw error;
  }
};

export const getTXState = async (transactionId: string) => {
  console.log(`Retrieving transaction state for: ${transactionId}`);

  try {
    const state = await redisClient.get(transactionId);
    if (!state) {
      console.log("Transaction state not found");
      return null;
    }

    return JSON.parse(state);
  } catch (error) {
    console.error("Error retrieving transaction state:", error);
    throw error;
  }
};

export async function saveIntermidiateTXState(
  transactionId: string,
  impsState: any,
  amount?: string
) {
  try {
    // Validate inputs - this is the key fix
    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }

    // Use the transactionId parameter instead of impsState.transactionId
    const existingState = await redisClient.get(transactionId);
    let txState: any;

    if (existingState) {
      txState = JSON.parse(existingState);
      // Initialize processingHistory if it doesn't exist
      if (!txState.processingHistory) {
        txState.processingHistory = [];
      }
      txState.processingHistory.push({
        step: impsState.step,
        timestamp: new Date().toISOString(),
        processor: impsState.processor,
      });
    } else {
      txState = {
        transactionId: transactionId,
        processingHistory: [
          {
            step: impsState.step,
            timestamp: new Date().toISOString(),
            processor: impsState.processor,
          },
        ],
      };
    }
    if (impsState.step === "CREDIT_BENEFICIARY_COMPLETE") {
      const finalState = {
        transactionId: transactionId,
        processingHistory: txState.processingHistory,
        remitterBank: {
          accountNo: txState.remitterBank.accountNo,
          ifscCode: txState.remitterBank.ifscCode,
          contactNo: txState.remitterBank.contactNo,
          mmid: txState.remitterBank.mmid,
        },
        beneficiaryBank: {
          accountNo: txState.beneficiaryBank.accountNo,
          ifscCode: txState.beneficiaryBank.ifscCode,
          contactNo: txState.beneficiaryBank.contactNo,
          mmid: txState.beneficiaryBank.mmid,
        },
        amount: txState.amount,
      };
      console.log("Saving intermediate transaction state " + finalState);
      await redisClient.set(transactionId, JSON.stringify(finalState));
    } else {
      await redisClient.set(transactionId, JSON.stringify(txState));
    }
    console.log("Intermediate transaction state saved successfully");
    return txState;
  } catch (error) {
    console.error("Error saving intermediate transaction state:", error);
    throw error;
  }
}
