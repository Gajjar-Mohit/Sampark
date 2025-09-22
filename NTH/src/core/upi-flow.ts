export const UPI_FLOW = [
  {
    step: "TRANSACTION_INITIATED",
    key: "upi-init-push-transaction",
    sequence: 1,
  },
  {
    step: "VERIFY_FROM_VPA",
    key: "upi-verify-from-vpa",
    sequence: 2,
  },
  {
    step: "VERIFY_FROM_VPA_COMPLETE",
    key: "upi-verify-from-vpa-complete",
    sequence: 3,
  },
  {
    step: "VERIFY_TO_VPA",
    key: "upi-verify-to-vpa",
    sequence: 4,
  },
  {
    step: "VERIFY_TO_VPA_COMPLETE",
    key: "upi-verify-to-vpa-complete",
    sequence: 5,
  },
  {
    step: "DEBIT_REMITTER",
    key: "upi-debit-remitter",
    sequence: 6,
  },
  {
    step: "DEBIT_REMITTER_COMPLETE",
    key: "upi-debit-remitter-success",
    sequence: 7,
  },
  {
    step: "CREDIT_BENEFICIARY",
    key: "upi-credit-beneficiary",
    sequence: 8,
  },
  {
    step: "CREDIT_BENEFICIARY_COMPLETE",
    key: "upi-credit-beneficiary-success",
    sequence: 9,
  },
  {
    step: "UPI_TRANSACTION_COMPLETE",
    key: "upi-transaction-complete",
    sequence: 10,
  },
];
