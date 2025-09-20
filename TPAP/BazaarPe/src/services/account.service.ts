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

    const vpa = response.data.data.accountHolderContactNo + "@okpvb";

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
