import axios from "axios";
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


export const pushTransactionService = async (
  toVpa: string,
  amount: number,
  contactNo: string
) => {
  if (!toVpa || !amount) {
    throw new Error("Invalid request");
  }

  const user = await prisma.user.findFirst({
    where: {
      phone: contactNo,
    },
    include: {
      vpas: true,
    },
  });
  if (!user) {
    throw new Error("User does not exist");
  }

  const userVPAs = user.vpas[0];
  if (!userVPAs) {
    throw new Error("User does not have a VPA");
  }

  try {
    let data = JSON.stringify({
      toVpa,
      amount,
      fromVpa: userVPAs.vpa,
    });

    const url = process.env.PSP_URL;

    let config = {
      method: "post",
      url: url + "/tpap/push",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log(response.data);
    if (!response.data.data) {
      throw new Error("Invalid response from PSP");
    }

    // const transaction = response.data.data;

    // const sentTransaction = await prisma.transaction.create({
    //   data: {
    //     fromVPAId: user.vpas[0].vpa,
    //     toVPAId: toVpa,
    //     amount,
    //     userId: user.id,
    //     type: "PUSH",
    //   },
    // });

    // if (!sentTransaction) {
    //   throw new Error("Failed to create transaction");
    // }
    return response.data.data;
  } catch (error) {
    return error;
  }
};
