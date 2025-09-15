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

  {
    accountHolderName: "Priya Sharma",
    accountHolderContactNo: "9876543210",
    panCardNo: "STUVW9012X",
  },
  {
    accountHolderName: "Rajesh Kumar",
    accountHolderContactNo: "8765432109",
    panCardNo: "YZABC3456D",
  },
  {
    accountHolderName: "Anita Gupta",
    accountHolderContactNo: "7654321098",
    panCardNo: "EFGHI7890J",
  },
  {
    accountHolderName: "Deepak Singh",
    accountHolderContactNo: "6543210987",
    panCardNo: "KLMNO1234P",
  },
  {
    accountHolderName: "Sunita Verma",
    accountHolderContactNo: "5432109876",
    panCardNo: "QRSTU5678V",
  },
  {
    accountHolderName: "Mukesh Patel",
    accountHolderContactNo: "4321098765",
    panCardNo: "WXYZB9012C",
  },
  {
    accountHolderName: "Kavita Joshi",
    accountHolderContactNo: "3210987654",
    panCardNo: "DEFGI3456H",
  },
  {
    accountHolderName: "Arjun Desai",
    accountHolderContactNo: "2109876543",
    panCardNo: "JKLNO7890P",
  },
  {
    accountHolderName: "Neha Agarwal",
    accountHolderContactNo: "9087654321",
    panCardNo: "QRSTV1234W",
  },
  {
    accountHolderName: "Vikram Mehta",
    accountHolderContactNo: "8976543210",
    panCardNo: "XYZAC5678D",
  },
  {
    accountHolderName: "Shanti Iyer",
    accountHolderContactNo: "7865432109",
    panCardNo: "EFGIK9012L",
  },
  {
    accountHolderName: "Rohit Bansal",
    accountHolderContactNo: "6754321098",
    panCardNo: "MNOPQ3456R",
  },
  {
    accountHolderName: "Geeta Devi",
    accountHolderContactNo: "5643210987",
    panCardNo: "STUVW7890X",
  },
  {
    accountHolderName: "Ashok Pandey",
    accountHolderContactNo: "4532109876",
    panCardNo: "YZABD1234E",
  },
  {
    accountHolderName: "Radha Krishnan",
    accountHolderContactNo: "3421098765",
    panCardNo: "FGHIJ5678K",
  },
  {
    accountHolderName: "Manish Sood",
    accountHolderContactNo: "2310987654",
    panCardNo: "LMNOP9012Q",
  },
  {
    accountHolderName: "Sushma Yadav",
    accountHolderContactNo: "9109876543",
    panCardNo: "RSTUV3456W",
  },
  {
    accountHolderName: "Ramesh Chand",
    accountHolderContactNo: "8098765432",
    panCardNo: "XYZAB7890C",
  },
  {
    accountHolderName: "Urmila Shah",
    accountHolderContactNo: "7987654321",
    panCardNo: "DEFGH1234I",
  },
  {
    accountHolderName: "Gopal Mishra",
    accountHolderContactNo: "6876543210",
    panCardNo: "JKLMN5678O",
  },
  {
    accountHolderName: "Indira Nath",
    accountHolderContactNo: "5765432109",
    panCardNo: "PQRST9012U",
  },
  {
    accountHolderName: "Sunil Thakur",
    accountHolderContactNo: "4654321098",
    panCardNo: "VWXYZ3456A",
  },
  {
    accountHolderName: "Alok Sharma",
    accountHolderContactNo: "3543210987",
    panCardNo: "ABCDE5678F",
  },
  {
    accountHolderName: "Tina Deshmukh",
    accountHolderContactNo: "2432109876",
    panCardNo: "FGHIJ9012K",
  },
  {
    accountHolderName: "Harsh Vardhan",
    accountHolderContactNo: "1321098765",
    panCardNo: "LMNOP3456Q",
  },
  {
    accountHolderName: "Bhavna Kapoor",
    accountHolderContactNo: "9213456780",
    panCardNo: "RSTUV7890W",
  },
  {
    accountHolderName: "Karan Malhotra",
    accountHolderContactNo: "8123456790",
    panCardNo: "XYZAB1234C",
  },
  {
    accountHolderName: "Divya Sen",
    accountHolderContactNo: "7034567891",
    panCardNo: "DEFGH5678I",
  },
  {
    accountHolderName: "Amitabh Joshi",
    accountHolderContactNo: "6945678902",
    panCardNo: "JKLMN9012O",
  },
  {
    accountHolderName: "Nalini Rao",
    accountHolderContactNo: "5856789013",
    panCardNo: "PQRST3456U",
  },
  {
    accountHolderName: "Farhan Qureshi",
    accountHolderContactNo: "4767890124",
    panCardNo: "VWXYZ7890A",
  },
  {
    accountHolderName: "Chitra Anand",
    accountHolderContactNo: "3678901235",
    panCardNo: "BCDEF1234G",
  },
  {
    accountHolderName: "Ritika Mehra",
    accountHolderContactNo: "2589012346",
    panCardNo: "GHIJK5678L",
  },
  {
    accountHolderName: "Ayaan Shaikh",
    accountHolderContactNo: "1490123457",
    panCardNo: "MNOPQ9012R",
  },
  {
    accountHolderName: "Simran Kaur",
    accountHolderContactNo: "9301234568",
    panCardNo: "STUVW3456X",
  },
  {
    accountHolderName: "Tarun Bhatia",
    accountHolderContactNo: "8212345679",
    panCardNo: "YZABC7890D",
  },
  {
    accountHolderName: "Rahul Sharma",
    accountHolderContactNo: "7123456780",
    panCardNo: "EFGHI5678J",
  },
  {
    accountHolderName: "Anjali Kumar",
    accountHolderContactNo: "6034567891",
    panCardNo: "KLMNO3456P",
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
