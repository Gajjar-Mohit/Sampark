import z from "zod";

export const GetAllTransactionsRequest = z.object({
  vpa: z.string(),
  userId: z.string(),
});