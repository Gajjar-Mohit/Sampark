import z from "zod";

export const GetAllTransactionsRequest = z.object({
  vpa: z.string(),
  userId: z.string(),
});

export const PushTransactionRequest = z.object({
  toVpa: z.string(),
  amount: z.number(),
  contactNo: z.string(),
});
