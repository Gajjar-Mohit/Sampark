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
  VERIFY_TO_VPA = "upi-verify-to-vpa",
  VERIFY_TO_VPA_COMPLETE = "upi-verify-to-vpa-complete",
  VERIFY_FROM_VPA = "upi-verify-from-vpa",
  VERIFY_FROM_VPA_COMPLETE = "upi-verify-from-vpa-complete",
  INIT_PUSH_TRANSACTION = "upi-init-push-transaction",
  UPI_DEBIT_REMITTER = "upi-debit-remitter",
  UPI_CREDIT_BENEFICIARY = "upi-credit-beneficiary",
  UPI_DEBIT_REMITTER_SUCCESS = "upi-debit-remitter-success",
  UPI_CREDIT_BENEFICIARY_SUCCESS = "upi-credit-beneficiary-success",
  UPI_TRANSACTION_COMPLETE = "upi-transaction-complete",
}
