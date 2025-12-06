use crate::types::payload::Step;



pub static imps_flow: std::sync::LazyLock<[Step; 7]> = std::sync::LazyLock::new(|| {
    [
        Step {
            step: String::from("TRANSACTION_INITIATED"),
            key: String::from("imps-transfer"),
            sequence: 1,
        },
        Step {
            step: String::from("VALIDATION_OF_BENEFICIARY_DETAILS"),
            key: String::from("imps-transfer-verify-details"),
            sequence: 2,
        },
        Step {
            step: String::from("VALIDATION_OF_BENEFICIARY_COMPLETE"),
            key: String::from("imps-transfer-verified-details"),
            sequence: 3,
        },
        Step {
            step: String::from("DEBIT_REMITTER"),
            key: String::from("imps-transfer-debit-remitter"),
            sequence: 4,
        },
        Step {
            step: String::from("DEBIT_REMITTER_COMPLETE"),
            key: String::from("imps-transfer-debit-remitter-success"),
            sequence: 5,
        },
        Step {
            step: String::from("CREDIT_BENEFICIARY"),
            key: String::from("imps-transfer-credit-beneficiary"),
            sequence: 6,
        },
        Step {
            step: String::from("CREDIT_BENEFICIARY_COMPLETE"),
            key: String::from("imps-transfer-credit-benificiary-success"),
            sequence: 7,
        },
    ]
});
