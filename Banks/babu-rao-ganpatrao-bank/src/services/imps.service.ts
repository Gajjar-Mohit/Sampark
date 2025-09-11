import prisma from "../db";

export const checkRemitterDetails = async (
  contactNo: string,
  accountNo: string,
  ifscCode: string,
  mmid: string
) => {
  if (!contactNo) {
    throw new Error("Contact number not found");
  }

  if (!accountNo && !mmid) {
    throw new Error("Account number or MMID not found");
  }
  if (accountNo && !ifscCode) {
    throw new Error("IFSC code not found");
  }

  if (accountNo && ifscCode && contactNo) {
    const account = await prisma.bankAccount.findFirst({
      where: {
        accountNo: accountNo,
        ifscCode: ifscCode,
        accountHolderContactNo: contactNo,
      },
    });
    if (!account) {
      return false;
    }
    return true;
  }
  if (mmid && contactNo) {
    const account = await prisma.bankAccount.findFirst({
      where: {
        mmid: mmid,
        accountHolderContactNo: contactNo,
      },
    });
    if (!account) {
      return false;
    }
    return true;
  }
};
