import { redisClient } from "..";
import type { Log } from "../types/log";

export const saveLog = async (log: Log) => {
  console.log(`Storing log for transaction: ${log.transactionId}`);
  try {
    const existingLog = await redisClient.get(log.transactionId);
    let logData: any;
    if (existingLog) {
      logData = JSON.parse(existingLog);
      logData.data.status = log.data.status;
      logData.data.amount = log.data.amount;
      logData.data.reasonOfFailure = log.data.reasonOfFailure;
      await redisClient.set(log.transactionId, JSON.stringify(logData));
      return logData;
    }
    logData = {
      transactionId: log.transactionId,
      data: {
        mode: log.data.mode,
        amount: log.data.amount,
        status: log.data.status,
        reasonOfFailure: log.data.reasonOfFailure,
        remitterAccount: {
          accountNo: log.data.remitterAccount.accountNo,
          ifscCode: log.data.remitterAccount.ifscCode,
          contactNo: log.data.remitterAccount.contactNo,
          mmid: log.data.remitterAccount.mmid,
        },
        beneficiaryAccount: {
          accountNo: log.data.beneficiaryAccount.accountNo,
          ifscCode: log.data.beneficiaryAccount.ifscCode,
          contactNo: log.data.beneficiaryAccount.contactNo,
          mmid: log.data.beneficiaryAccount.mmid,
        },
      },
    };
    await redisClient.set(log.transactionId, JSON.stringify(logData));
    return logData;
  } catch (error) {
    console.error("Error storing log:", error);
    throw error;
  }
};

export const updateStatusToComplete = async (transactionId: string) => {
  try {
    const res = await redisClient.get(transactionId);
    if (res) {
      const parsedLog = JSON.parse(res);
      if (
        parsedLog.data.status === "PENDING" ||
        parsedLog.data.status === "FAILED"
      ) {
        parsedLog.data.status = "COMPLETED";
        await redisClient.set(transactionId, parsedLog);
      }
    }
  } catch (error) {
    console.error("Error retrieving log:", error);
    throw error;
  }
};

export const getLogByTransactionId = async (transactionId: string) => {
  console.log(`Retrieving log for transaction: ${transactionId}`);
  try {
    const log = await redisClient.get(transactionId);
    if (!log) {
      console.log("Log not found");
      return null;
    }
    return JSON.parse(log);
  } catch (error) {
    console.error("Error retrieving log:", error);
    throw error;
  }
};
