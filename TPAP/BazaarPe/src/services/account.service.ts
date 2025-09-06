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

    // Send Request to PSP Bank to check user is registered in the bank
    

};
