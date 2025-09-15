import axios from "axios";
import {
  BABU_RAO_GANPAT_RAO_BANK_URL,
  CHAI_PANI_BANK_URL,
  CHINTA_MAT_KARO_BANK_URL,
  PAISA_VASUL_BANK_URL,
} from "./config/baseurls";

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

let allCreatedAccounts: any[] = [];

describe("Bank Account Creation", () => {
  beforeAll(async () => {
    allCreatedAccounts = [];
    const creationPromises = bankAccountRequests.flatMap((request) => [
      createAccountInChintaMatKaroBank(request).then((response) => ({
        response,
        bank: "Chinta Mat Karo Bank",
        request,
      })),
      createAccountInChaiPaniBank(request).then((response) => ({
        response,
        bank: "Chai Pani Bank",
        request,
      })),
      createAccountInPaisaVasulBank(request).then((response) => ({
        response,
        bank: "Paisa Vasul Bank",
        request,
      })),
      createAccountInBabuRaoGanapatRaoBank(request).then((response) => ({
        response,
        bank: "Babu Rao Ganpat Rao Bank",
        request,
      })),
    ]);

    const results = await Promise.all(creationPromises);
    allCreatedAccounts = results.map((result) => result.response.data.data);
  });

  test.each(bankAccountRequests)(
    "Create account in Chinta Mat Karo Bank - $accountHolderName",
    async (request) => {
      const response = await createAccountInChintaMatKaroBank(request);
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        accountHolderName: request.accountHolderName,
        accountHolderContactNo: request.accountHolderContactNo,
        panCardNo: request.panCardNo,
      });
      expect(response.data.data.accountNo).toBeDefined();
      expect(response.data.data.ifscCode).toBeDefined();
    }
  );

  test.each(bankAccountRequests)(
    "Create account in Chai Pani Bank - $accountHolderName",
    async (request) => {
      const response = await createAccountInChaiPaniBank(request);
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        accountHolderName: request.accountHolderName,
        accountHolderContactNo: request.accountHolderContactNo,
        panCardNo: request.panCardNo,
      });
      expect(response.data.data.accountNo).toBeDefined();
      expect(response.data.data.ifscCode).toBeDefined();
    }
  );

  test.each(bankAccountRequests)(
    "Create account in Paisa Vasul Bank - $accountHolderName",
    async (request) => {
      const response = await createAccountInPaisaVasulBank(request);
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        accountHolderName: request.accountHolderName,
        accountHolderContactNo: request.accountHolderContactNo,
        panCardNo: request.panCardNo,
      });
      expect(response.data.data.accountNo).toBeDefined();
      expect(response.data.data.ifscCode).toBeDefined();
    }
  );

  test.each(bankAccountRequests)(
    "Create account in Babu Rao Ganpat Rao Bank - $accountHolderName",
    async (request) => {
      const response = await createAccountInBabuRaoGanapatRaoBank(request);
      expect(response.status).toBe(200);
      expect(response.data.data).toMatchObject({
        accountHolderName: request.accountHolderName,
        accountHolderContactNo: request.accountHolderContactNo,
        panCardNo: request.panCardNo,
      });
      expect(response.data.data.accountNo).toBeDefined();
      expect(response.data.data.ifscCode).toBeDefined();
    }
  );
});

describe("Check Balance", () => {
  beforeAll(() => {
    console.log(`Total accounts created: ${allCreatedAccounts.length}`);
    if (allCreatedAccounts.length === 0) {
      throw new Error("No accounts were created. Balance tests cannot run.");
    }
  });

  test.each(
    allCreatedAccounts.filter((account) => account?.ifscCode?.includes("CMK"))
  )(
    "Check balance for Chinta Mat Karo Bank - $accountHolderName",
    async (accountHolder) => {
      const response = await checkBalanceInChintaMatKaroBank({
        accountNo: accountHolder.accountNo,
        accountHolderContactNo: accountHolder.accountHolderContactNo,
        ifscCode: accountHolder.ifscCode,
      });
      expect(response.status).toBe(200);
      expect(response.data.data.balance).toBe(5000);
    }
  );

  test.each(
    allCreatedAccounts.filter((account) => account?.ifscCode?.includes("CPB"))
  )(
    "Check balance for Chai Pani Bank - $accountHolderName",
    async (accountHolder) => {
      const response = await checkBalanceInChaiPaniBank({
        accountNo: accountHolder.accountNo,
        accountHolderContactNo: accountHolder.accountHolderContactNo,
        ifscCode: accountHolder.ifscCode,
      });
      expect(response.status).toBe(200);
      expect(response.data.data.balance).toBe(5000);
    }
  );

  test.each(
    allCreatedAccounts.filter((account) => account?.ifscCode?.includes("PVB"))
  )(
    "Check balance for Paisa Vasul Bank - $accountHolderName",
    async (accountHolder) => {
      const response = await checkBalanceInPaisaVasulBank({
        accountNo: accountHolder.accountNo,
        accountHolderContactNo: accountHolder.accountHolderContactNo,
        ifscCode: accountHolder.ifscCode,
      });
      expect(response.status).toBe(200);
      expect(response.data.data.balance).toBe(5000);
    }
  );

  test.each(
    allCreatedAccounts.filter((account) => account?.ifscCode?.includes("BRG"))
  )(
    "Check balance for Babu Rao Ganpat Rao Bank - $accountHolderName",
    async (accountHolder) => {
      const response = await checkBalanceInBabuRaoGanapatRaoBank({
        accountNo: accountHolder.accountNo,
        accountHolderContactNo: accountHolder.accountHolderContactNo,
        ifscCode: accountHolder.ifscCode,
      });
      expect(response.status).toBe(200);
      expect(response.data.data.balance).toBe(5000);
    }
  );
});

async function createAccountInChintaMatKaroBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${CHINTA_MAT_KARO_BANK_URL}/api/v1/account/new`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function createAccountInChaiPaniBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${CHAI_PANI_BANK_URL}/api/v1/account/new`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function createAccountInPaisaVasulBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${PAISA_VASUL_BANK_URL}/api/v1/account/new`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function createAccountInBabuRaoGanapatRaoBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${BABU_RAO_GANPAT_RAO_BANK_URL}/api/v1/account/new`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function checkBalanceInChintaMatKaroBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${CHINTA_MAT_KARO_BANK_URL}/api/v1/account/check-balance`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function checkBalanceInChaiPaniBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${CHAI_PANI_BANK_URL}/api/v1/account/check-balance`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function checkBalanceInPaisaVasulBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${PAISA_VASUL_BANK_URL}/api/v1/account/check-balance`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}

async function checkBalanceInBabuRaoGanapatRaoBank(bankAccountRequest: any) {
  const data = JSON.stringify(bankAccountRequest);
  const config = {
    method: "post",
    url: `${BABU_RAO_GANPAT_RAO_BANK_URL}/api/v1/account/check-balance`,
    headers: { "Content-Type": "application/json" },
    data,
  };
  return await axios.request(config);
}
