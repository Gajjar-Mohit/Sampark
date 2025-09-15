import z from "zod";

export interface AccountType {
  id: string;
  balance: number;
  bankId: string;
  accountNo: string;
  accountHolderName: string;
  accountHolderContactNo: string;
  ifscCode: string;
  panCardNo: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CreateAccountRequest = z.object({
  accountHolderName: z.string(),
  accountHolderContactNo: z.string(),
  panCardNo: z.string(),
});

export const CheckBalanceRequest = z.object({
  ifscCode: z.string(),
  accountHolderContactNo: z.string(),
  accountNo: z.string(),
});
