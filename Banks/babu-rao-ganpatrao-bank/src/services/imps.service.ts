import prisma from "../db";

export const checkRemitterDetails = async (
  contactNo: string,
  accountNo: string,
  ifscCode: string,
  mmid: string
) => {
  if (!contactNo) {
    throw new Error("Contact number not found");
  }

  if (!accountNo && !mmid) {
    throw new Error("Account number or MMID not found");
  }
  if (accountNo && !ifscCode) {
    throw new Error("IFSC code not found");
  }

  if (accountNo && ifscCode && contactNo) {
    const account = await prisma.bankAccount.findFirst({
      where: {
        accountNo: accountNo,
        ifscCode: ifscCode,
        accountHolderContactNo: contactNo,
      },
    });
    if (!account) {
      return false;
    }
    return true;
  }
  if (mmid && contactNo) {
    const account = await prisma.bankAccount.findFirst({
      where: {
        mmid: mmid,
        accountHolderContactNo: contactNo,
      },
    });
    if (!account) {
      return false;
    }
    return true;
  }
};

export const debitBankAccount = async (
  accountNo: string,
  ifscCode: string,
  contactNo: string,
  amount: number
) => {
  try {
    // Input validation
    if (!accountNo || !ifscCode || !contactNo) {
      throw new Error(
        "Account number, IFSC code, and contact number are required"
      );
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    console.log(`Attempting to debit ${amount} from account ${accountNo}`);

    const result = await prisma.$transaction(async (tx) => {
      // Get current account details
      const account = await tx.bankAccount.findFirst({
        where: {
          accountNo: accountNo,
          ifscCode: ifscCode,
          accountHolderContactNo: contactNo,
        },
        select: {
          id: true,
          balance: true,
          accountNo: true,
          ifscCode: true,
        },
      });

      if (!account) {
        throw new Error("Account not found or details don't match");
      }

      console.log(
        `Current balance: ${account.balance}, Debit amount: ${amount}`
      );

      const currentBalance = Number(account.balance);
      const debitAmount = Number(amount);

      if (currentBalance < debitAmount) {
        throw new Error(
          `Insufficient balance. Available: ${currentBalance}, Required: ${debitAmount}`
        );
      }

      // Calculate new balance
      const newBalance = currentBalance - debitAmount;

      console.log(`New balance will be: ${newBalance}`);

      // Ensure newBalance is a valid number
      if (isNaN(newBalance)) {
        throw new Error("Error calculating new balance");
      }

      // Update account with the new balance
      const updatedAccount = await tx.bankAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: newBalance, // Make sure this is a number, not undefined
        },
      });

      return {
        previousBalance: currentBalance,
        updatedAccount,
      };
    });

    console.log(
      `Successfully debited ${amount}. New balance: ${result.updatedAccount.balance}`
    );

    return {
      success: true,
      account: result.updatedAccount,
      previousBalance: result.previousBalance,
      newBalance: result.updatedAccount.balance,
      debitedAmount: amount,
    };
  } catch (error) {
    console.error("Error debiting bank account:", error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to debit bank account");
  }
};



export const creditBankAccount = async (
  accountNo: string,
  ifscCode: string,
  contactNo: string,
  amount: number
) => {
  try {
    // Input validation
    if (!accountNo || !ifscCode || !contactNo) {
      throw new Error(
        "Account number, IFSC code, and contact number are required"
      );
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    console.log(`Attempting to debit ${amount} from account ${accountNo}`);

    const result = await prisma.$transaction(async (tx) => {
      // Get current account details
      const account = await tx.bankAccount.findFirst({
        where: {
          accountNo: accountNo,
          ifscCode: ifscCode,
          accountHolderContactNo: contactNo,
        },
        select: {
          id: true,
          balance: true,
          accountNo: true,
          ifscCode: true,
        },
      });

      if (!account) {
        throw new Error("Account not found or details don't match");
      }

      console.log(
        `Current balance: ${account.balance}, Debit amount: ${amount}`
      );

      const currentBalance = Number(account.balance);
      const debitAmount = Number(amount);

      if (currentBalance < debitAmount) {
        throw new Error(
          `Insufficient balance. Available: ${currentBalance}, Required: ${debitAmount}`
        );
      }

      // Calculate new balance
      const newBalance = currentBalance + debitAmount;

      console.log(`New balance will be: ${newBalance}`);

      // Ensure newBalance is a valid number
      if (isNaN(newBalance)) {
        throw new Error("Error calculating new balance");
      }

      // Update account with the new balance
      const updatedAccount = await tx.bankAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: newBalance, // Make sure this is a number, not undefined
        },
      });

      return {
        previousBalance: currentBalance,
        updatedAccount,
      };
    });

    console.log(
      `Successfully debited ${amount}. New balance: ${result.updatedAccount.balance}`
    );

    return {
      success: true,
      account: result.updatedAccount,
      previousBalance: result.previousBalance,
      newBalance: result.updatedAccount.balance,
      debitedAmount: amount,
    };
  } catch (error) {
    console.error("Error debiting bank account:", error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to debit bank account");
  }
};


