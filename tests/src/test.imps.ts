import axios from "axios";
import { relative } from "path";

async function createBeneficaryAccount() {
  let data = JSON.stringify({
    accountHolderName: "Mohit Gajjar",
    accountHolderContactNo: "2342344572",
    panCardNo: "1234567890",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:3002/api/v1/account/new",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response.data.data;
}

async function createRemitterAccount() {
  let data = JSON.stringify({
    accountHolderName: "Tony Stark",
    accountHolderContactNo: "2342344562",
    panCardNo: "1234567898",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://localhost:3001/api/v1/account/new",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response.data.data;
}

export const impsTest = async () => {
  const beneficiaryAccount = await createBeneficaryAccount();
  const remitterAccount = await createRemitterAccount();

  const preppairImpsData = {
    beneficiaryAccountNo: beneficiaryAccount.accountNo,
    beneficiaryMobileNo: beneficiaryAccount.accountHolderContactNo,
    beneficiaryMMID: "",
    benificiaryIFSCode: beneficiaryAccount.ifscCode,
    amount: "1000",
    remitterAccountNo: remitterAccount.accountNo,
    remitterMobileNo: remitterAccount.accountHolderContactNo,
    remitterMMID: "",
    remitterIFSCode: remitterAccount.ifscCode,
  };

  console.log(JSON.stringify(preppairImpsData));
};
