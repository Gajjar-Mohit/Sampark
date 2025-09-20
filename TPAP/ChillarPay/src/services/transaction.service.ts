import prisma from "../db";

export async function getAllTransactionsService(vpa: string, userId: string) {
  if (!vpa || !userId) {
    throw new Error("Missing VPA or UserId");
  }
  try {
    const checkVPA = await prisma.vPA.findFirst({
      where: {
        vpa,
      },
    });

    const checkUser = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!checkUser) {
      throw new Error("User not found");
    }

    if (!checkVPA) {
      throw new Error("VPA not found");
    }

    const sentTransactions = await prisma.transaction.findMany({
      where: {
        toVPAId: vpa,
        userId: userId,
      },
    });
    const recievedTransactions = await prisma.transaction.findMany({
      where: {
        fromVPAId: vpa,
        userId: userId,
      },
    });

    return {
      sentTransactions: {
        ...sentTransactions,
      },
      recievedTransactions: {
        ...recievedTransactions,
      },
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to retrive all transactions");
  }
}
