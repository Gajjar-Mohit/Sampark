import axios from "axios";
import {
  BABU_RAO_GANPAT_RAO_BANK_URL,
  CHAI_PANI_BANK_URL,
  CHINTA_MAT_KARO_BANK_URL,
  PAISA_VASUL_BANK_URL,
} from "../config/baseurls";

function sum(a: number, b: number) {
  return a + b;
}

const bankAccountRequests = [
  {
    accountHolderName: "Ravi Nair",
    accountHolderContactNo: "9123456789",
    panCardNo: "ABCDE1234F",
  },
  {
    accountHolderName: "Suman Reddy",
    accountHolderContactNo: "8234567890",
    panCardNo: "FGHIJ5678K",
  },
  {
    accountHolderName: "Kiran Menon",
    accountHolderContactNo: "7345678901",
    panCardNo: "LMNOP9012Q",
  },
  {
    accountHolderName: "Asha Bhat",
    accountHolderContactNo: "6456789012",
    panCardNo: "RSTUV3456W",
  },
  {
    accountHolderName: "Nitin Kapoor",
    accountHolderContactNo: "5567890123",
    panCardNo: "XYZAB7890C",
  },
  {
    accountHolderName: "Meera Pillai",
    accountHolderContactNo: "4678901234",
    panCardNo: "DEFGH1234I",
  },
  {
    accountHolderName: "Suresh Rao",
    accountHolderContactNo: "3789012345",
    panCardNo: "JKLMN5678O",
  },
  {
    accountHolderName: "Pooja Malhotra",
    accountHolderContactNo: "2890123456",
    panCardNo: "PQRST9012U",
  },
  {
    accountHolderName: "Anil Khanna",
    accountHolderContactNo: "9901234567",
    panCardNo: "VWXYZ3456A",
  },
  {
    accountHolderName: "Rekha Tiwari",
    accountHolderContactNo: "8012345678",
    panCardNo: "BCDEF7890G",
  },
  {
    accountHolderName: "Vinay Shetty",
    accountHolderContactNo: "7123456789",
    panCardNo: "GHIJK1234L",
  },
  {
    accountHolderName: "Lakshmi Naidu",
    accountHolderContactNo: "6234567890",
    panCardNo: "MNOPQ5678R",
  },
];

describe("Bank Accounts Creation", () => {
  for (const bankAccountRequest of bankAccountRequests) {
    test(`Bank: Chinta Mat Karo Bank, Account Creator: ${bankAccountRequest.accountHolderName}`, async () => {
      const response = await createAccountInChintaMatKaroBank(
        bankAccountRequest
      );
      expect(response.status).toBe(200);
    });

    test(`Bank: Chai Pani Bank, Account Creator: ${bankAccountRequest.accountHolderName}`, async () => {
      const response = await createAccountInChaiPaniBank(bankAccountRequest);
      expect(response.status).toBe(200);
    });

    test(`Bank: Paisa Vasul Bank, Account Creator: ${bankAccountRequest.accountHolderName}`, async () => {
      const response = await createAccountInPaisaVasulBank(bankAccountRequest);
      expect(response.status).toBe(200);
    });

    test(`Bank: Babu Rao Ganpat Rao Bank, Account Creator: ${bankAccountRequest.accountHolderName}`, async () => {
      const response = await createAccountInBabuRaoGanapatRaoBank(
        bankAccountRequest
      );
      expect(response.status).toBe(200);
    });
  }
});

async function createAccountInChintaMatKaroBank(bankAccountRequest: any) {
  let data = JSON.stringify(bankAccountRequest);

  let config = {
    method: "post",
    url: `${CHINTA_MAT_KARO_BANK_URL}/api/v1/account/new`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response;
}

async function createAccountInChaiPaniBank(bankAccountRequest: any) {
  let data = JSON.stringify(bankAccountRequest);

  let config = {
    method: "post",
    url: `${CHAI_PANI_BANK_URL}/api/v1/account/new`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response;
}
async function createAccountInPaisaVasulBank(bankAccountRequest: any) {
  let data = JSON.stringify(bankAccountRequest);

  let config = {
    method: "post",
    url: `${PAISA_VASUL_BANK_URL}/api/v1/account/new`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response;
}
async function createAccountInBabuRaoGanapatRaoBank(bankAccountRequest: any) {
  let data = JSON.stringify(bankAccountRequest);

  let config = {
    method: "post",
    url: `${BABU_RAO_GANPAT_RAO_BANK_URL}/api/v1/account/new`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const response = await axios.request(config);
  return response;
}
