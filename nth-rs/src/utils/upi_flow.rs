use crate::types::payload::Step;



pub static upi_flow: std::sync::LazyLock<[Step; 10]> = std::sync::LazyLock::new(|| { [
 Step {
    step: String::from("TRANSACTION_INITIATED"),
    key: String::from("upi-init-push-transaction"),
    sequence: 1,
  },
  Step{
    step: String::from("VERIFY_FROM_VPA"),
    key: String::from("upi-verify-from-vpa"),
    sequence: 2,
  },
  Step{
    step: String::from("VERIFY_FROM_VPA_COMPLETE"),
    key: String::from("upi-verify-from-vpa-complete"),
    sequence: 3,
  },
  Step{
    step: String::from("VERIFY_TO_VPA"),
    key: String::from("upi-verify-to-vpa"),
    sequence: 4,
  },
  Step{
    step: String::from("VERIFY_TO_VPA_COMPLETE"),
    key:String::from( "upi-verify-to-vpa-complete"),
    sequence: 5,
  },
  Step{
    step: String::from("DEBIT_REMITTER"),
    key: String::from("upi-debit-remitter"),
    sequence: 6,
  },
  Step{
    step: String::from("DEBIT_REMITTER_COMPLETE"),
    key: String::from("upi-debit-remitter-success"),
    sequence: 7,
  },
  Step{
    step:String::from( "CREDIT_BENEFICIARY"),
    key: String::from("upi-credit-beneficiary"),
    sequence: 8,
  },
  Step{
    step: String::from("CREDIT_BENEFICIARY_COMPLETE"),
    key:String::from( "upi-credit-beneficiary-success"),
    sequence: 9,
  },
  Step{
    step:String::from( "UPI_TRANSACTION_COMPLETE"),
    key: String::from("upi-transaction-complete"),
    sequence: 10,
  },
]
});
