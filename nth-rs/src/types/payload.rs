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
pub struct VerifiedUpiBankAccount {
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
    pub requestedBy: String,
    pub txnId: String,
}

#[derive(Serialize, Deserialize)]
pub struct IMPSTransactionState {
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

pub struct Step {
    pub step: String,
    pub key: String,
    pub sequence: u8,
}

#[derive(Serialize, Deserialize)]
pub struct InitUpiPayload {
    pub txnId: String,
    pub toVpa: String,
    pub fromVpa: String,
    pub amount: Number,
    pub requestedBy: String,
}
#[derive(Serialize, Deserialize)]
pub struct VerifiedVpa {
    pub accountNo: String,
    pub ifscCode: String,
    pub contactNo: String,
    pub name: String,
    pub vpa: String,
    pub txnId: String,
}

#[derive(Serialize, Deserialize)]
pub struct UpiTransactionState {
    pub txnId: String,
    pub toVpa: String,
    pub fromVpa: String,
    pub amount: Number,
    pub requestedBy: String,
    pub senderBank: VerifiedVpa,
    pub recieverBank: VerifiedVpa,
    pub processing_history: Vec<State>,
}


#[derive(Serialize, Deserialize)]
pub struct UpiTransactionStateWithoutBanks {
    pub txnId: String,
    pub toVpa: String,
    pub fromVpa: String,
    pub amount: Number,
    pub requestedBy: String,
    pub processing_history: Vec<State>,
}

#[derive(Serialize, Deserialize)]
pub struct DebitRemitterPayload {
    pub amount: Number,
    pub beneficiaryBank: VerifiedVpa,
    pub senderBank: VerifiedVpa,
    pub txnId: String
}