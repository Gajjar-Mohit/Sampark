import z from "zod";

export enum CardType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum CardStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum CardProvider {
  VISA = "VISA",
  MASTERCARD = "MASTERCARD",
  RUPAY = "RUPAY",
}

export interface Card {
  id: string;
  cardNo: string;
  bankAccount: string;
  cardType: CardType;
  status: CardStatus;
  provider: CardProvider;
  pin: string;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CreateCardRequest = z.object({
  bankAccountNo: z.string(),
  cardType: z.enum([CardType.CREDIT, CardType.DEBIT]),
  provider: z.enum([
    CardProvider.VISA,
    CardProvider.MASTERCARD,
    CardProvider.RUPAY,
  ]),
});
