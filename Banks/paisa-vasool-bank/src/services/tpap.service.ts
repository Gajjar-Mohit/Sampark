import { sendResponseToNTH } from "./nth.service";

export const getBankDetails = async (contactNo: string, ifscCode: string) => {
  if (!contactNo || !ifscCode) {
    throw new Error("Invalid request");
  }

  const response = await sendResponseToNTH(contactNo, ifscCode);
  console.log("Response from NTH", response);
  return response;
};
