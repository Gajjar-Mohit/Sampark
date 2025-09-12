export const IMPS_FLOW = [
  {
    step: "TRANSACTION_INITIATED",
    key: "imps-transfer",
    sequence: 1,
  },
  {
    step: "VALIDATION_OF_BENEFICIARY_DETAILS",
    key: "imps-transfer-verify-details",
    sequence: 2,
  },
  {
    step: "VALIDATION_OF_BENEFICIARY_COMPLETE",
    key: "imps-transfer-verified-details",
    sequence: 3,
  },
  {
    step: "DEBIT_REMITTER",
    key: "imps-transfer-debit-remitter",
    sequence: 4,
  },
  {
    step: "DEBIT_REMITTER_COMPLETE",
    key: "imps-transfer-debit-remitter-success",
    sequence: 5,
  },
  {
    step: "CREDIT_BENEFICIARY",
    key: "imps-transfer-credit-beneficiary",
    sequence: 6,
  },
  {
    step: "CREDIT_BENEFICIARY_COMPLETE",
    key: "imps-transfer-credit-benificiary-success",
    sequence: 7,
  },
];
