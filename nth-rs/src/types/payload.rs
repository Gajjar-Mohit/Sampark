use serde::{Deserialize, Serialize};
use serde_json::Number;

// #[derive(Serialize, Deserialize)]
// pub struct Payload {
//     pub txnId: String,
//     pub amount: u64,
//     pub remitterDetails: BankAccount,
//     pub beneficiaryDetails: BankAccount
// }

// #[derive(Serialize, Deserialize)]
// pub struct BankAccount {
//     pub accountNo: u128,
//     pub ifscCode: String,
//     pub contactNo: u64,
//     pub mmid: String,
// }

#[derive(Serialize, Deserialize)]
pub struct Payload {
    pub txnId: String,
    pub amount: String,
    pub remitterDetails: BankAccount,
    pub beneficiaryDetails: BankAccount,
}

#[derive(Serialize, Deserialize)]
pub struct BankAccount {
    pub accountNo: String,
    pub ifscCode: String,
    pub contactNo: String,
    pub mmid: String,
}

#[derive(Serialize, Deserialize)]
pub struct AddBankAccount {
    pub txnId: String,
    pub contactNo: String,
    pub ifscCode: String,
    pub requestedBy: String,
}

#[derive(Serialize, Deserialize)]
pub struct VerifiedBankAccount {
    pub id: String,
    pub balance: f64,
    pub accountNo: String,
    pub accountHolderContactNo: String,
    pub ifscCode: String,
    pub mmid: String,
    pub branchName: String,
    pub panCardNo: String,
    pub createdAt: String,
    pub updatedAt: String,
    pub txnId: String,
}

#[derive(Serialize, Deserialize)]
pub struct TransactionState {
    pub amount: Number,
    pub benificary: BankAccount,
    pub processing_history: Vec<State>,
    pub remitter: BankAccount,
    pub txn_id: String,
}
#[derive(Serialize, Deserialize)]
pub struct State {
    pub processor: String,
    pub step: String,
    pub time_stamp: String,
}