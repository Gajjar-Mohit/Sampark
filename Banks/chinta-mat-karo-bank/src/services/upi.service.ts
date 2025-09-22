import prisma from "../db";

export const createVpaAndLinkAccount = async (details: any) => {
  const vpa = details.accountHolderContactNo + "@cmk";

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

export const verifyVpaService = async (vpa: string, txnId: string) => {
  const vpaDetails = await prisma.vpaToAccountMapping.findFirst({
    where: {
      vpa,
    },
  });

  if (!vpaDetails) {
    return {
      success: false,
      error: "VPA not found",
    };
  }

  return {
    success: true,
    data: {
      accountNo: vpaDetails.accountNumber,
      ifscCode: vpaDetails.ifscCode,
      contactNo: vpaDetails.contactNo,
      name: vpaDetails.name,
      vpa,
    },
  };
};
