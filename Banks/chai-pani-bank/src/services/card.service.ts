import prisma from "../db";
import { generateCardNumber } from "../utils/card_number_generator";
import { generateCardPin } from "../utils/card_ping_generator";
import { generateCardValidityDate } from "../utils/card_validity_date_generator";
import { CustomError } from "../utils/error_handler";

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

export const changeCardPin = async (cardNumber: string, newPin: string) => {
  if (!cardNumber) {
    throw new CustomError("Card number not found", 400);
  }

  if (!newPin) {
    throw new CustomError("New pin not found", 400);
  }
  const card = await prisma.card.findFirst({
    where: {
      cardNo: cardNumber,
    },
    select: {
      id: true,
      pin: true,
    },
  });

  if (!card) {
    throw new CustomError("Card not found", 400);
  }

  const updatedCard = await prisma.card.update({
    where: {
      id: card.id,
    },
    data: {
      pin: newPin,
    },
  });

  return updatedCard;
};
