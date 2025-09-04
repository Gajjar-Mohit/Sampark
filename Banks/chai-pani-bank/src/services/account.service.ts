import prisma from "../db";
import { generateBankAccountNumber } from "../utils/account_number_genrator";
import { generateCardNumber } from "../utils/card_number_generator";
import { generateCardPin } from "../utils/card_ping_generator";
import { generateCardValidityDate } from "../utils/card_validity_date_generator";
import { CustomError } from "../utils/error_handler";

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

  if (!accountNo) {
    throw new CustomError("Account number not found", 400);
  }

  if (!ifscCode) {
    throw new CustomError("IFSC code not found", 400);
  }

  if (!branchName) {
    throw new CustomError("Branch name not found", 400);
  }
  const account = await prisma.bankAccount.create({
    data: {
      accountHolderName,
      accountHolderContactNo,
      panCardNo,
      ifscCode,
      branchName,
      accountNo,
    },
  });

  return account;
};

export const createCard = async (
  bankAccountNo: string,
  cardType: any,
  provider: any
) => {
  if (!bankAccountNo) {
    throw new CustomError("Bank account number not found", 400);
  }

  if (!cardType) {
    throw new CustomError("Card type not found", 400);
  }

  if (!provider) {
    throw new CustomError("Card provider not found", 400);
  }

  const getBankAccount = await prisma.bankAccount.findFirst({
    where: {
      accountNo: bankAccountNo,
    },
    select: {
      id: true,
      Card: true,
    },
  });

  if (!getBankAccount) {
    throw new CustomError("Bank account not found", 400);
  }

  const getCard = await prisma.card.findMany({
    where: {
      bankAccountId: getBankAccount.id,
    },
  });

  getCard.forEach((card) => {
    if (card.cardType === cardType && card.provider === provider) {
      throw new CustomError(
        `${cardType} Card already exists in this bank account`,
        400
      );
    }
  });

  const pin = generateCardPin();
  const cardNo = generateCardNumber();
  const expiryDate = generateCardValidityDate();

  if (!cardNo) {
    throw new CustomError("Card number generation error", 400);
  }

  if (!expiryDate) {
    throw new CustomError("Card expiry date generation error", 400);
  }

  if (!pin) {
    throw new CustomError("Card pin generation error", 400);
  }

  const card = await prisma.card.create({
    data: {
      bankAccount: {
        connect: {
          id: getBankAccount.id,
        },
      },
      pin,
      cardType: cardType,
      provider,
      expiryDate: expiryDate,
      status: "ACTIVE",
      cardNo,
    },
  });

  return card;
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
