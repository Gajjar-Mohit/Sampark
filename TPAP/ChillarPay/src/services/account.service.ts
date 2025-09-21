import axios from "axios";
import prisma from "../db";

export const addAccount = async (contactNo: string, ifscCode: string) => {
  if (!contactNo || !ifscCode) {
    throw new Error("Invalid request");
  }

  const userExists = await prisma.user.findFirst({
    where: {
      phone: contactNo,
    },
  });
  if (!userExists) {
    throw new Error("User does not exist");
  }

  try {
    let data = JSON.stringify({
      contactNo,
      ifscCode,
    });

    const url = process.env.PSP_URL;

    let config = {
      method: "post",
      url: url + "/tpap/check",
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

    const vpa = response.data.data.vpa;

    const verified = await prisma.user.update({
      where: {
        phone: contactNo,
      },
      data: {
        verified: true,
        vpas: {
          create: {
            vpa,
          },
        },
      },
    });
    if (!verified) {
      throw new Error("Failed to update user");
    }
    return response.data.data;
  } catch (error) {
    return error;
  }
};

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
