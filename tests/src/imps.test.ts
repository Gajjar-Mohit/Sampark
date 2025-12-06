// import axios from "axios";
// import { readFileSync } from "fs"; // Using fs for synchronous reading
// import path from "path";

// // Bank URLs
// export const BABU_RAO_GANPAT_RAO_BANK_URL = "http://localhost:3001";
// export const CHAI_PANI_BANK_URL = "http://localhost:3002";
// export const CHINTA_MAT_KARO_BANK_URL = "http://localhost:3003";
// export const PAISA_VASUL_BANK_URL = "http://localhost:3004";

// const bankUrls: { [key: string]: string } = {
//   BRG: BABU_RAO_GANPAT_RAO_BANK_URL,
//   CPB: CHAI_PANI_BANK_URL,
//   CMK: CHINTA_MAT_KARO_BANK_URL,
//   PVB: PAISA_VASUL_BANK_URL,
// };

// const banks = ["BRG", "CPB", "CMK", "PVB"];

// // Define an interface for the account object to improve type safety
// interface Account {
//   accountNo: string;
//   accountHolderName: string;
//   accountHolderContactNo: string;
//   ifscCode: string;
//   panCardNo: string;
//   mmid: string;
//   // Add other properties as needed
// }

// /**
//  * Gets the bank code from IFSC code
//  * @param ifscCode - The IFSC code
//  * @returns The bank code (first 3 characters)
//  */
// function getBankCodeFromIFSC(ifscCode: string): string {
//   return ifscCode.substring(0, 3);
// }

// /**
//  * Initiates an IMPS transfer request to the remitter's bank.
//  * @param transferData - The payload for the IMPS transfer.
//  * @param bankUrl - The URL of the remitter's bank.
//  * @returns The response from the server.
//  */
// async function initiateIMPSTransfer(transferData: any, bankUrl: string) {
//   const config = {
//     method: "post",
//     url: `${bankUrl}/api/v1/imps/initiate`,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     data: JSON.stringify(transferData),
//   };

//   return await axios.request(config);
// }

// // --- DATA PREPARATION ---
// // We must load data synchronously at the top level.
// // If we load it in beforeAll(), it won't be ready when 'describe' blocks run to generate tests.
// const people: { [pan: string]: { [bank: string]: Account } } = {};
// let personList: string[] = [];

// try {
//   // Read and parse the JSON file synchronously
//   const fileContent = readFileSync("userAccounts.json", "utf-8");
//   const allAccounts = JSON.parse(fileContent) as Account[];

//   // Organize accounts by PAN and bank
//   for (let acc of allAccounts) {
//     const pan = acc.panCardNo;
//     if (!people[pan]) {
//       people[pan] = {};
//     }
//     const bank = getBankCodeFromIFSC(acc.ifscCode);
//     people[pan][bank] = acc;
//   }
//   personList = Object.keys(people);
//   console.log("Data loaded successfully. People count:", personList.length);
// } catch (error) {
//   console.error("Error loading userAccounts.json:", error);
// }

// describe("IMPS Transfer Combinations", () => {
//   // You can still use beforeAll for debug logging if you wish
//   beforeAll(() => {
//     // Debug: Check first person
//     if (personList.length > 0) {
//       const firstPan = personList[0];
//       const firstPerson = people[firstPan!];

//       // FIX 1: Check if 'firstPerson' is defined before accessing keys
//       if (firstPerson) {
//         console.log("\n=== DEBUG INFO ===");
//         console.log("First person PAN:", firstPan);
//         console.log("Banks available:", Object.keys(firstPerson));
//         console.log(
//           "Total accounts per person:",
//           Object.keys(firstPerson).length
//         );
//       }
//     }

//     // Check a few people
//     let peopleWithAllBanks = 0;
//     for (const pan of personList) {
//       const person = people[pan];
//       // FIX 2: Check if 'person' is defined
//       if (person) {
//         const banksForPerson = Object.keys(person);
//         if (banksForPerson.length === 4) {
//           peopleWithAllBanks++;
//         }
//       }
//     }
//     console.log("People with all 4 banks:", peopleWithAllBanks);
//   });

//   // Generate test suites for each bank-to-bank combination
//   banks.forEach((remitterBank) => {
//     banks.forEach((beneficiaryBank) => {
//       if (remitterBank !== beneficiaryBank) {
//         describe(`Transfers from ${remitterBank} to ${beneficiaryBank}`, () => {
//           // Find people who have accounts in both remitter and beneficiary banks
//           const validPeople = personList
//             .filter((pan) => {
//               const person = people[pan];
//               if (!person) return false;

//               const hasRemitter = remitterBank in person;
//               const hasBeneficiary = beneficiaryBank in person;

//               return hasRemitter && hasBeneficiary;
//             })
//             .map((pan) => {
//               const person = people[pan];
//               // Optional chaining handles undefined safely here
//               const remitterAcc = person?.[remitterBank];
//               return {
//                 pan,
//                 name: remitterAcc?.accountHolderName || "Unknown",
//               };
//             });

//           if (validPeople.length === 0) {
//             // Use test.skip properly if no data matches
//             test.skip(`No people found with accounts in both ${remitterBank} and ${beneficiaryBank}`, () => {});
//             return;
//           }

//           console.log(
//             `\n${remitterBank} -> ${beneficiaryBank}: ${validPeople.length} valid transfers`
//           );

//           test.each(validPeople)(
//             `Transfer from $name's ${remitterBank} account to their ${beneficiaryBank} account`,
//             async ({ pan }: { pan: string; name: string }) => {
//               // Get remitter account (from remitter bank)
//               const remitterAccount = people[pan]?.[remitterBank];
//               // Get beneficiary account (from beneficiary bank)
//               const beneficiaryAccount = people[pan]?.[beneficiaryBank];

//               if (!remitterAccount || !beneficiaryAccount) {
//                 throw new Error(
//                   `Could not find accounts for ${pan} in ${remitterBank} or ${beneficiaryBank}`
//                 );
//               }

//               console.log(
//                 `Testing transfer from ${remitterAccount.accountNo} (${remitterBank}) to ${beneficiaryAccount.accountNo} (${beneficiaryBank})`
//               );

//               // Prepare IMPS transfer data
//               const impsData = {
//                 beneficiaryAccountNo: beneficiaryAccount.accountNo,
//                 beneficiaryMobileNo: beneficiaryAccount.accountHolderContactNo,
//                 beneficiaryMMID: beneficiaryAccount.mmid,
//                 benificiaryIFSCode: beneficiaryAccount.ifscCode,
//                 amount: "100",
//                 remitterAccountNo: remitterAccount.accountNo,
//                 remitterMobileNo: remitterAccount.accountHolderContactNo,
//                 remitterMMID: remitterAccount.mmid,
//                 remitterIFSCode: remitterAccount.ifscCode,
//               };

//               // Call the remitter's bank API
//               const remitterBankUrl = bankUrls[remitterBank];
//               if (!remitterBankUrl) {
//                 throw new Error(`Bank URL not found for ${remitterBank}`);
//               }

//               // Initiate transfer from remitter's bank
//               const response = await initiateIMPSTransfer(
//                 impsData,
//                 remitterBankUrl
//               );

//               // Assert response
//               expect(response.status).toBe(200);
//               expect(response.data).toBeDefined();
//               expect(response.data.status).toBe("Transfer complete");
//             },
//             15000 // Increased timeout
//           );
//         });
//       }
//     });
//   });
// });
