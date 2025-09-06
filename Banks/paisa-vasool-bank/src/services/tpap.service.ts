import prisma from "../db";

export const getBankDetails = async (contactNo: string, ifscCode: string) => {
  if (!contactNo || !ifscCode) {
    throw new Error("Invalid request");
  }

  //Forward the request to the NTH to check if the user is registered in the bank
  
};
