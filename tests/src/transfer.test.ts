import axios from "axios";
import { file } from "bun";

// Bank URLs
export const BABU_RAO_GANPAT_RAO_BANK_URL = "http://localhost:3001";
export const CHAI_PANI_BANK_URL = "http://localhost:3002";
export const CHINTA_MAT_KARO_BANK_URL = "http://localhost:3003";
export const PAISA_VASUL_BANK_URL = "http://localhost:3004";

const bankUrls: { [key: string]: string } = {
  BRG: BABU_RAO_GANPAT_RAO_BANK_URL,
  CPB: CHAI_PANI_BANK_URL,
  CMK: CHINTA_MAT_KARO_BANK_URL,
  PVB: PAISA_VASUL_BANK_URL,
};

const banks = ["BRG", "CPB", "CMK", "PVB"];

// Define an interface for the account object to improve type safety
interface Account {
  accountNo: string;
  accountHolderName: string;
  accountHolderContactNo: string;
  ifscCode: string;
  panCardNo: string;
  // Add other properties as needed
}

/**
 * Finds and returns the first account for a given bank code and PAN card.
 * @param allAccounts - The array of all user accounts.
 * @param bankCode - The bank code to search for (e.g., "BRG", "CPB").
 * @param panCardNo - The PAN card number to match.
 * @returns The matching account object, or undefined if not found.
 */
function findAccountByBank(
  allAccounts: Account[],
  bankCode: string,
  panCardNo: string
): Account | undefined {
  return allAccounts.find(
    (account) =>
      account.ifscCode.includes(bankCode) && account.panCardNo === panCardNo
  );
}

/**
 * Initiates an IMPS transfer request to the remitter's bank.
 * @param transferData - The payload for the IMPS transfer.
 * @param bankUrl - The URL of the remitter's bank.
 * @returns The response from the server.
 */
async function initiateIMPSTransfer(transferData: any, bankUrl: string) {
  const config = {
    method: "post",
    url: `${bankUrl}/api/v1/imps/initiate`,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(transferData),
  };

  return await axios.request(config);
}

describe("IMPS Transfer Combinations", () => {
  let people: { [pan: string]: { [bank: string]: Account } } = {};
  let personList: string[] = [];
  let allAccounts: Account[] = [];

  beforeAll(async () => {
    // Read and parse the JSON file
    const fileContent = await file("userAccounts.json").text();
    allAccounts = JSON.parse(fileContent) as Account[];

    // Organize accounts by PAN and bank
    for (let acc of allAccounts) {
      const pan = acc.panCardNo;
      if (!people[pan]) {
        people[pan] = {};
      }
      const bank = acc.ifscCode.substring(0, 3);
      people[pan][bank] = acc;
    }
    personList = Object.keys(people);
    console.log("Number of people:", personList.length);
  });

  // Generate test suites for each bank-to-bank combination
  banks.forEach((fromBank) => {
    banks.forEach((toBank) => {
      if (fromBank !== toBank) {
        describe(`Transfers from ${fromBank} to ${toBank}`, () => {
          test.each(
            personList
              .filter((pan) => people[pan]![fromBank]! && people[pan]![toBank])
              .map((pan) => ({
                pan,
                name: people[pan]![fromBank]?.accountHolderName,
              }))
          )(
            "Initiate IMPS Transfer - $name from ${fromBank} to ${toBank}",
            async ({ pan }) => {
              // Find remitter and beneficiary accounts with type assertion
              const remitterAccount = findAccountByBank(
                allAccounts,
                fromBank,
                pan as string
              );
              const beneficiaryAccount = findAccountByBank(
                allAccounts,
                toBank,
                pan as string
              );

              if (!remitterAccount || !beneficiaryAccount) {
                throw new Error(
                  `Could not find suitable accounts for ${pan} in ${fromBank} or ${toBank}`
                );
              }

              // Prepare IMPS transfer data with type safety
              const impsData = {
                beneficiaryAccountNo: beneficiaryAccount.accountNo,
                beneficiaryMobileNo: beneficiaryAccount.accountHolderContactNo,
                beneficiaryMMID: "",
                benificiaryIFSCode: beneficiaryAccount.ifscCode,
                amount: "100",
                remitterAccountNo: remitterAccount.accountNo,
                remitterMobileNo: remitterAccount.accountHolderContactNo,
                remitterMMID: "",
                remitterIFSCode: remitterAccount.ifscCode,
              };

              // Initiate transfer
              const response = await initiateIMPSTransfer(
                impsData,
                bankUrls[fromBank] ?? ""
              );

              // Assert response
              expect(response.status).toBe(200);
            },
            10000 // 10-second timeout for async operations
          );
        });
      }
    });
  });
});
