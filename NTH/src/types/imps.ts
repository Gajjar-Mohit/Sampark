export interface IMPSState {
  transactionId: string;
  correlationId?: string;
  currentStep: string;
  previousStep: string;
  stepSequence: number;
  data: any;
  processingHistory?: ProcessingHistorry[];
  processor: string;
}
export interface ProcessingHistorry {
  step: string;
  timestamp: string;
  processor: string;
}


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
