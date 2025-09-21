import prisma from "../db";

export const createVpaAndLinkAccount = async (details: any) => {
  const vpa = details.accountHolderContactNo + "@pvb";

  if (details) {
    await prisma.vpaToAccountMapping.create({
      data: {
        vpa,
        accountNumber: details.accountNo,
        ifscCode: details.ifscCode,
        contactNo: details.accountHolderContactNo,
        name: details.accountHolderName,
      },
    });
  }

  return {
    accountNo: details.accountNo,
    ifscCode: details.ifscCode,
    contactNo: details.accountHolderContactNo,
    name: details.accountHolderName,
    vpa,
  };
};
