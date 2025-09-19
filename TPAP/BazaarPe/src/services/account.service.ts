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

    let config = {
      method: "post",
      url: "http://localhost:3004/api/v1/tpap/check",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);

    if (!response.data.data) {
      throw new Error("Invalid response from PSP");
    }

    const verified = await prisma.user.update({
      where: {
        phone: contactNo,
      },
      data: {
        verified: true,
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
