export enum MessageType {
  //IMPS Transfer
  VERIFY_DETAILS = "imps-transfer-verify-details",
  DEBIT_REMITTER = "imps-transfer-debit-remitter",
  CREDIT_BENEFICIARY = "imps-transfer-credit-beneficiary",
  DEBIT_SUCCESS = "imps-transfer-debit-remitter-success",
  CREDIT_SUCCESS = "imps-transfer-credit-benificiary-success",
  VERIFIED_DETAILS = "imps-transfer-verified-details",
  ACCOUNT_DETAILS = "account-details",
  IMPS_TRANSFER = "imps-transfer",
  IMPS_TRANSFER_COMPLETE = "imps-transfer-complete",
  IMPS_TRANSFER_ERROR = "imps-transfer-error",

  //UPI Transfer
  ADD_BANK_DETAILS = "upi-add-bank-details",
  BANK_DETAILS_ADDED = "upi-bank-details-added",
}
