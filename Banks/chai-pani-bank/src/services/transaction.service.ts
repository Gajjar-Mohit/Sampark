import prisma from "../db";

export const storeTransaction = async (
  transactionId: string,
  amount: number,
  type: string,
  accountNo: string,
  description: string
) => {
  console.log(`Storing transaction: ${transactionId}`);
  try {
    const account = await prisma.bankAccount.findFirst({
      where: {
        accountNo: accountNo,
      },
    });
    if (!account) {
      console.log("Account not found");
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: amount,
        account: { connect: { id: account.id } },
        transactionId: transactionId,
        mode: type,
        description: description,
      },
    });
    return transaction;
  } catch (error) {
    console.error("Error storing transaction:", error);
    throw error;
  }
};

export const getAllTransactions = async () => {
  const transactions = await prisma.transaction.findMany();
  return transactions;
};