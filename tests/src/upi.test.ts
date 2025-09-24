import axios from "axios";
import { file } from "bun";
import { describe, beforeAll, test, expect } from "bun:test";
import {
  BABU_RAO_GANPAT_RAO_BANK_URL,
  BAZZAR_PAY,
  CHAI_PANI_BANK_URL,
  CHILLAR_PAY,
  CHINTA_MAT_KARO_BANK_URL,
  PAISA_VASUL_BANK_URL,
} from "./config/baseurls";

interface Account {
  accountNo: string;
  accountHolderName: string;
  accountHolderContactNo: string;
  ifscCode: string;
  panCardNo: string;
  mmid: string;
}

interface BankAccount {
  bankCode: string;
  ifscCode: string;
  accountNo: string;
  mmid: string;
}

interface ValidPerson {
  pan: string;
  name: string;
  contactNo: string;
  email: string;
  banks: string[];
  bankAccounts: BankAccount[];
  totalAccounts: number;
}

const bankUrls: Record<string, string> = {
  BRG: BABU_RAO_GANPAT_RAO_BANK_URL,
  CPB: CHAI_PANI_BANK_URL,
  CMK: CHINTA_MAT_KARO_BANK_URL,
  PVB: PAISA_VASUL_BANK_URL,
};

const banks: string[] = ["BRG", "CPB", "CMK", "PVB"];

async function initiateUPITransfer(transferData: any, tpapUrl: string) {
  const data = JSON.stringify(transferData);

  const config = {
    method: "post" as const,
    maxBodyLength: Infinity,
    url: `${tpapUrl}/api/v1/transaction/push`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
    timeout: 10000, // 10 second timeout
  };

  try {
    return await axios.request(config);
  } catch (error) {
    console.error(`Transfer failed: ${JSON.stringify(transferData)}`, error);
    throw error;
  }
}

async function createAccounts(data: any, tpapUrl: string) {
  const data1 = JSON.stringify(data);

  const config = {
    method: "post" as const,
    maxBodyLength: Infinity,
    url: `${tpapUrl}/api/v1/user/create`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data1,
    timeout: 10000, // 10 second timeout
  };

  try {
    return await axios.request(config);
  } catch (error) {
    console.error(`Account creation failed: ${JSON.stringify(data)}`, error);
    throw error;
  }
}

async function addBankAccount(data: any, tpapUrl: string) {
  const data1 = JSON.stringify(data);

  const config = {
    method: "post" as const,
    maxBodyLength: Infinity,
    url: `${tpapUrl}/api/v1/account/add`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data1,
    timeout: 10000, // 10 second timeout
  };

  try {
    return await axios.request(config);
  } catch (error) {
    console.error(
      `Bank account addition failed: ${JSON.stringify(data)}`,
      error
    );
    throw error;
  }
}

function getBankCodeFromIFSC(ifscCode: string): string {
  return ifscCode.substring(0, 3);
}

const tpapUrls = [
  { url: CHILLAR_PAY, code: "@cmk" },
  { url: BAZZAR_PAY, code: "@pvb" },
];

// Load and prepare test data at module level
async function loadTestData(): Promise<ValidPerson[]> {
  const fileContent = await file("userAccounts.json").text();
  const allAccounts = JSON.parse(fileContent) as Account[];

  const people: Record<string, Record<string, Account>> = {};

  // Organize accounts by PAN and bank
  for (const acc of allAccounts) {
    const pan = acc.panCardNo;
    if (!people[pan]) {
      people[pan] = {};
    }
    const bank = getBankCodeFromIFSC(acc.ifscCode);
    people[pan][bank] = acc;
  }

  const personList = Object.keys(people);
  console.log("Number of unique people:", personList.length);
  console.log("Total accounts:", allAccounts.length);

  // Create unique test data for each person with ALL bank IFSC codes
  const validPeople = personList.map((pan: string): ValidPerson => {
    const userBanks = Object.keys(people[pan]!);
    const primaryBank = userBanks[0];
    const primaryAccount = people[pan]![primaryBank!];

    // Create bank accounts array with IFSC codes for ALL banks
    const bankAccounts: BankAccount[] = userBanks.map((bankCode) => {
      const account = people[pan]![bankCode]!;
      return {
        bankCode,
        ifscCode: account.ifscCode,
        accountNo: account.accountNo,
        mmid: account.mmid,
      };
    });

    return {
      pan,
      name: primaryAccount?.accountHolderName || "Unknown",
      contactNo: primaryAccount?.accountHolderContactNo || "unknown",
      email:
        (primaryAccount?.accountHolderName || "unknown")
          .replaceAll(" ", "")
          .toLowerCase() + "@gmail.com",
      banks: userBanks,
      bankAccounts,
      totalAccounts: userBanks.length,
    };
  });

  console.log("Number of people for testing:", validPeople.length);
  return validPeople;
}

// Load test data at module level
const testData = await loadTestData();
let createdTpapAccounts: any = [];

describe("UPI Transfer System", () => {
  // Account Creation Tests
  describe("User Account Creation", () => {
    tpapUrls.forEach((tpap) => {
      describe(`Creating accounts on ${tpap.code.toUpperCase()}`, () => {
        test.each(testData)(
          "Should create account for $name (PAN: $pan)",
          async ({
            pan,
            name,
            contactNo,
            email,
            banks,
            bankAccounts,
            totalAccounts,
          }: ValidPerson) => {
            console.log(
              `Creating account for: ${name} (PAN: ${pan}) with ${totalAccounts} bank accounts across: ${banks.join(
                ", "
              )}`
            );

            const accountCreationResponse = await createAccounts(
              {
                contactNo,
                name,
                email,
              },
              tpap.url
            );
            createdTpapAccounts.push(accountCreationResponse);

            expect(accountCreationResponse.status).toBe(200);
          }
        );
      });
    });
  });

  // Bank Account Addition Tests
  describe("Bank Account Addition", () => {
    tpapUrls.forEach((tpap) => {
      describe(`Adding bank accounts on ${tpap.code.toUpperCase()}`, () => {
        test.each(testData)(
          "Should add all bank accounts for $name (PAN: $pan)",
          async ({
            pan,
            name,
            contactNo,
            email,
            banks,
            bankAccounts,
            totalAccounts,
          }: ValidPerson) => {
            console.log(
              `Adding ${totalAccounts} bank accounts for: ${name} (PAN: ${pan})`
            );

            // Add all bank accounts for this user
            for (const bankAccount of bankAccounts) {
              console.log(
                `  Adding ${bankAccount.bankCode} account: ${bankAccount.accountNo} (IFSC: ${bankAccount.ifscCode})`
              );

              const linkBankAccountResponse = await addBankAccount(
                {
                  ifscCode: bankAccount.ifscCode,
                  contactNo,
                },
                tpap.url
              );
              expect(linkBankAccountResponse.status).toBe(200);
            }
          }
        );
      });
    });
  });

  // UPI Transfer Tests
  describe("UPI Transfer Tests", () => {
    tpapUrls.forEach((tpap) => {
      describe(`UPI Transfers on ${tpap.code.toUpperCase()}`, () => {
        // Test Case 1: Same Person, Different Accounts
        describe("Same Person Different Account Transfers", () => {
          test.each(testData.filter((person) => person.totalAccounts > 1))(
            "Should transfer between different accounts of $name (PAN: $pan)",
            async ({
              pan,
              name,
              contactNo,
              email,
              banks,
              bankAccounts,
              totalAccounts,
            }: ValidPerson) => {
              console.log(
                `Testing intra-person transfers for: ${name} (${totalAccounts} accounts across ${banks.length} banks)`
              );

              // Limit transfers to avoid timeout - test only first 2 accounts to all others
              const maxFromAccounts = Math.min(2, bankAccounts.length);
              let transferCount = 0;
              const maxTransfers = 6; // Limit total transfers per person

              for (
                let i = 0;
                i < maxFromAccounts && transferCount < maxTransfers;
                i++
              ) {
                for (
                  let j = 0;
                  j < bankAccounts.length && transferCount < maxTransfers;
                  j++
                ) {
                  if (i !== j) {
                    const fromAccount = bankAccounts[i]!;
                    const toAccount = bankAccounts[j]!;

                    console.log(
                      `  Transfer ${transferCount + 1}: ${
                        fromAccount.bankCode
                      }(${fromAccount.accountNo}) → ${toAccount.bankCode}(${
                        toAccount.accountNo
                      })`
                    );

                    try {
                      const transferResponse = await initiateUPITransfer(
                        {
                          toVpa: toAccount.accountNo + tpap.code,
                          contactNo,
                          amount: 50,
                        },
                        tpap.url
                      );

                      expect(transferResponse.status).toBe(200);
                      expect(transferResponse.data.data.status).toBe(
                        "COMPLETE"
                      );
                      transferCount++;

                      // Add small delay between transfers to avoid overwhelming the API
                      await new Promise((resolve) => setTimeout(resolve, 100));
                    } catch (error) {
                      console.error(`Transfer failed for ${name}: ${error}`);
                      throw error;
                    }
                  }
                }
              }

              console.log(`  Completed ${transferCount} transfers for ${name}`);
            },
            15000 // 15 second timeout per test
          );
        });

        // Test Case 2: Same Bank, Different Persons
        describe("Same Bank Different Person Transfers", () => {
          banks.forEach((bankCode) => {
            test(`Should transfer between different persons in ${bankCode} bank`, async () => {
              console.log(
                `Testing inter-person transfers within ${bankCode} bank`
              );

              // Filter people who have accounts in this specific bank
              const peopleWithThisBank = testData.filter((person) =>
                person.banks.includes(bankCode)
              );

              if (peopleWithThisBank.length < 2) {
                console.log(
                  `  Skipping ${bankCode} - only ${peopleWithThisBank.length} person(s) with this bank`
                );
                return;
              }

              console.log(
                `  Found ${peopleWithThisBank.length} people with ${bankCode} accounts`
              );

              // Limit to first 5 people to avoid timeout
              const limitedPeople = peopleWithThisBank.slice(0, 5);
              let transferCount = 0;
              const maxTransfers = 10; // Limit total transfers per bank

              // Test transfers between limited pairs of people in this bank
              for (
                let i = 0;
                i < limitedPeople.length && transferCount < maxTransfers;
                i++
              ) {
                for (
                  let j = 0;
                  j < limitedPeople.length && transferCount < maxTransfers;
                  j++
                ) {
                  if (i !== j) {
                    const sender = limitedPeople[i]!;
                    const receiver = limitedPeople[j]!;

                    const senderBankAccount = sender.bankAccounts.find(
                      (acc) => acc.bankCode === bankCode
                    );
                    const receiverBankAccount = receiver.bankAccounts.find(
                      (acc) => acc.bankCode === bankCode
                    );

                    if (senderBankAccount && receiverBankAccount) {
                      console.log(
                        `  Transfer ${transferCount + 1}: ${sender.name} → ${
                          receiver.name
                        } (${bankCode})`
                      );

                      try {
                        const transferResponse = await initiateUPITransfer(
                          {
                            toVpa: receiverBankAccount.accountNo + tpap.code,
                            contactNo: sender.contactNo,
                            amount: 75,
                          },
                          tpap.url
                        );

                        expect(transferResponse.status).toBe(200);
                        expect(transferResponse.data.data.status).toBe(
                          "COMPLETE"
                        );
                        transferCount++;

                        // Add small delay between transfers
                        await new Promise((resolve) =>
                          setTimeout(resolve, 100)
                        );
                      } catch (error) {
                        console.error(
                          `Transfer failed in ${bankCode}: ${error}`
                        );
                        throw error;
                      }
                    }
                  }
                }
              }

              console.log(
                `  Completed ${transferCount} transfers for ${bankCode} bank`
              );
            }, 20000); // 20 second timeout per bank test
          });
        });

        // Test Case 3: Cross-Bank Transfers (Different Banks, Different/Same Persons)
        describe("Cross-Bank Transfers", () => {
          test("Should transfer between different banks and different persons", async () => {
            console.log(
              "Testing cross-bank transfers between different persons"
            );

            const transferPairs: Array<{
              sender: ValidPerson;
              senderAccount: BankAccount;
              receiver: ValidPerson;
              receiverAccount: BankAccount;
            }> = [];

            // Create limited transfer pairs for cross-bank transactions
            for (let i = 0; i < Math.min(testData.length, 10); i++) {
              for (let j = 0; j < Math.min(testData.length, 10); j++) {
                if (i !== j && transferPairs.length < 10) {
                  // Limit to 10 pairs
                  const sender = testData[i]!;
                  const receiver = testData[j]!;

                  // Find accounts from different banks
                  for (const senderAccount of sender.bankAccounts) {
                    for (const receiverAccount of receiver.bankAccounts) {
                      if (
                        senderAccount.bankCode !== receiverAccount.bankCode &&
                        transferPairs.length < 10
                      ) {
                        transferPairs.push({
                          sender,
                          senderAccount,
                          receiver,
                          receiverAccount,
                        });
                        break; // Only one pair per sender-receiver combination
                      }
                    }
                    if (transferPairs.length >= 10) break;
                  }
                }
                if (transferPairs.length >= 10) break;
              }
              if (transferPairs.length >= 10) break;
            }

            console.log(
              `  Testing ${transferPairs.length} cross-bank transfer pairs`
            );

            for (let i = 0; i < transferPairs.length; i++) {
              const { sender, senderAccount, receiver, receiverAccount } =
                transferPairs[i]!;
              console.log(
                `  Cross-bank ${i + 1}: ${sender.name}(${
                  senderAccount.bankCode
                }) → ${receiver.name}(${receiverAccount.bankCode})`
              );

              try {
                const transferResponse = await initiateUPITransfer(
                  {
                    toVpa: receiverAccount.accountNo + tpap.code,
                    contactNo: sender.contactNo,
                    amount: 100,
                  },
                  tpap.url
                );

                expect(transferResponse.status).toBe(200);
                expect(transferResponse.data.data.status).toBe("COMPLETE");

                // Add small delay between transfers
                await new Promise((resolve) => setTimeout(resolve, 200));
              } catch (error) {
                console.error(`Cross-bank transfer failed: ${error}`);
                throw error;
              }
            }
          }, 30000); // 30 second timeout for cross-bank test
        });

        // Test Case 4: Bulk Transfer Validation
        describe("Bulk Transfer Validation", () => {
          test("Should handle multiple concurrent transfers", async () => {
            console.log("Testing bulk concurrent transfers");

            // Select a subset of people for bulk testing
            const bulkTestData = testData.slice(0, 5); // First 5 people only
            const transferPromises: Promise<any>[] = [];

            for (const person of bulkTestData) {
              if (person.bankAccounts.length > 1) {
                const fromAccount = person.bankAccounts[0]!;
                const toAccount = person.bankAccounts[1]!;

                const transferPromise = initiateUPITransfer(
                  {
                    toVpa: toAccount.accountNo + tpap.code,
                    contactNo: person.contactNo,
                    amount: 25,
                  },
                  tpap.url
                );

                transferPromises.push(transferPromise);
              }
            }

            console.log(
              `  Executing ${transferPromises.length} concurrent transfers`
            );

            try {
              const results = await Promise.all(transferPromises);

              results.forEach((result, index) => {
                expect(result.status).toBe(200);
                expect(result.data.data.status).toBe("COMPLETE");
              });

              console.log(
                `  All ${results.length} bulk transfers completed successfully`
              );
            } catch (error) {
              console.error(`Bulk transfer failed: ${error}`);
              throw error;
            }
          }, 15000); // 15 second timeout for bulk test
        });
      });
    });
  });

  // Summary Tests
  describe("Test Summary", () => {
    test("Should provide test execution summary", () => {
      console.log("\n=== TEST EXECUTION SUMMARY ===");
      console.log(`Total People Tested: ${testData.length}`);
      console.log(
        `Total Bank Accounts: ${testData.reduce(
          (sum, person) => sum + person.totalAccounts,
          0
        )}`
      );
      console.log(`Banks Covered: ${banks.join(", ")}`);
      console.log(
        `TPAP Applications: ${tpapUrls.map((t) => t.code).join(", ")}`
      );

      const bankDistribution = banks.map((bank) => {
        const count = testData.filter((person) =>
          person.banks.includes(bank)
        ).length;
        return `${bank}: ${count} people`;
      });
      console.log(`Bank Distribution: ${bankDistribution.join(", ")}`);
      console.log("===============================\n");

      expect(testData.length).toBeGreaterThan(0);
      expect(banks.length).toBe(4);
      expect(tpapUrls.length).toBe(2);
    });
  });
});
