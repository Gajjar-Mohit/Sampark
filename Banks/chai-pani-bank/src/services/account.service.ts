import prisma from "../db";
import { generateBankAccountNumber } from "../utils/account_number_genrator";
import { generateCardNumber } from "../utils/card_number_generator";
import { generateCardPin } from "../utils/card_ping_generator";
import { generateCardValidityDate } from "../utils/card_validity_date_generator";
import { CustomError } from "../utils/error_handler";
import { generateMMID } from "../utils/mmid_generator";

export const createAccount = async (
  accountHolderName: string,
  accountHolderContactNo: string,
  panCardNo: string
) => {
  const accountNo = generateBankAccountNumber();
  const getIfscCode = await prisma.branch.findMany();
  const branchIndex = Math.floor(Math.random() * getIfscCode.length);
  const ifscCode = getIfscCode[branchIndex]?.code;
  const branchName = getIfscCode[branchIndex]?.name;
  const mmid = generateMMID();

  if (!accountNo) {
    throw new CustomError("Account number not found", 400);
  }

  if (!ifscCode) {
    throw new CustomError("IFSC code not found", 400);
  }

  if (!branchName) {
    throw new CustomError("Branch name not found", 400);
  }

  if (!mmid) {
    throw new CustomError("MMID not found", 400);
  }

  const account = await prisma.bankAccount.create({
    data: {
      accountHolderName,
      accountHolderContactNo,
      panCardNo,
      ifscCode,
      branchName,
      accountNo,
      mmid,
    },
  });

  return account;
};

export const getAccountByMMID = async (mmid: string, contactNo: string) => {
  return await prisma.bankAccount.findFirst({
    where: {
      mmid,
      accountHolderContactNo: contactNo,
    },
  });
};

export const getAccountByAccountNo = async (accountNo: string) => {
  return await prisma.bankAccount.findFirst({
    where: {
      accountNo: accountNo,
    },
  });
};

export const getAccount = async (id: string) => {
  return await prisma.bankAccount.findUnique({
    where: {
      id,
    },
  });
};

export const getAccounts = async () => {
  return await prisma.bankAccount.findMany();
};

export const updateAccount = async (id: string, account: any) => {
  return await prisma.bankAccount.update({
    where: {
      id,
    },
    data: account,
  });
};

export const deleteAccount = async (id: string) => {
  return await prisma.bankAccount.delete({
    where: {
      id,
    },
  });
};
