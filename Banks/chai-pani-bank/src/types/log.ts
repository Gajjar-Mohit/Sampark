export interface Log {
  transactionId: string;
  data: {
    mode: string;
    amount: string;
    status: string;
    reasonOfFailure: string;
    remitterAccount: {
      accountNo: string;
      ifscCode: string;
      contactNo: string;
      mmid: string;
    };
    beneficiaryAccount: {
      accountNo: string;
      ifscCode: string;
      contactNo: string;
      mmid: string;
    };
  };
}
