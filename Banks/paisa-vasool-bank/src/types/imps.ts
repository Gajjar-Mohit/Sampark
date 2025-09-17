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


export enum MessageType {
  VERIFY_DETAILS = "imps-transfer-verify-details",
  DEBIT_REMITTER = "imps-transfer-debit-remitter",
  CREDIT_BENEFICIARY = "imps-transfer-credit-beneficiary",
  DEBIT_SUCCESS = "imps-transfer-debit-remitter-success",
  CREDIT_SUCCESS = "imps-transfer-credit-benificiary-success",
  VERIFIED_DETAILS = "imps-transfer-verified-details",
  ACCOUNT_DETAILS = "account-details",
  IMPS_TRANSFER = "imps-transfer",
}

export interface RemitterDetails {
  accountNo: string;
  ifscCode: string;
  contactNo: string;
  mmid: string;
}

export interface BeneficiaryDetails {
  accountNo: string;
  ifscCode: string;
  contactNo: string;
  mmid: string;
}

export interface TransferDetails {
  remitterDetails: RemitterDetails;
  beneficiaryDetails: BeneficiaryDetails;
  txnId: string;
  amount: string;
}

export interface VerifyDetailsRequest {
  accountNo: string;
  ifscCode: string;
  requestedBy: string;
  txnId: string;
}
