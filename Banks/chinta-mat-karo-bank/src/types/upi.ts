import z from "zod";

export const CheckBankDetailsRequest = z.object({
  contactNo: z.string().min(10).max(10),
  ifscCode: z.string().min(2).max(50),
});
