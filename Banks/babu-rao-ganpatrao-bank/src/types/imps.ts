import z from "zod";

export const IMPS_TranferRequest = z.object({
  beneficiaryAccountNo: z.string().optional(),
  beneficiaryMobileNo: z.string(),
  beneficiaryMMID: z.string().optional(),
  benificiaryIFSCode: z.string().optional(),
  amount: z.string(),
  remitterAccountNo: z.string().optional(),
  remitterMobileNo: z.string(),
  remitterMMID: z.string().optional(),
  remitterIFSCode: z.string().optional(),
});