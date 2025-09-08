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
    const response = await axios.post(
      "http://localhost:3004/api/v1/tpap/check",
      {
        contactNo,
        ifscCode,
      }
    );
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
    console.log(error);
  }
};
