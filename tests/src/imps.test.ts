// import axios from "axios";
// import { file } from "bun";

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

// describe("IMPS Transfer Combinations", () => {
//   let people: { [pan: string]: { [bank: string]: Account } } = {};
//   let personList: string[] = [];
//   let allAccounts: Account[] = [];

//   beforeAll(async () => {
//     // Read and parse the JSON file
//     const fileContent = await file("userAccounts.json").text();
//     allAccounts = JSON.parse(fileContent) as Account[];

//     // Organize accounts by PAN and bank
//     for (let acc of allAccounts) {
//       const pan = acc.panCardNo;
//       if (!people[pan]) {
//         people[pan] = {};
//       }
//       const bank = getBankCodeFromIFSC(acc.ifscCode);
//       people[pan][bank] = acc;
//     }
//     personList = Object.keys(people);
//     console.log("Number of people:", personList.length);
//   });

//   // Generate test suites for each bank-to-bank combination
//   banks.forEach((remitterBank) => {
//     banks.forEach((beneficiaryBank) => {
//       if (remitterBank !== beneficiaryBank) {
//         describe(`Transfers from ${remitterBank} to ${beneficiaryBank}`, () => {
//           // Find people who have accounts in both remitter and beneficiary banks
//           const validPeople = personList
//             .filter(
//               (pan) =>
//                 people![pan]![remitterBank] && people[pan]![beneficiaryBank]
//             )
//             .map((pan) => ({
//               pan,
//               name: people[pan]![remitterBank]?.accountHolderName || "Unknown",
//             }));

//           if (validPeople.length === 0) {
//             test.skip(`No people found with accounts in both ${remitterBank} and ${beneficiaryBank}`, () => {});
//             return;
//           }

//           test.each(validPeople)(
//             `Transfer from $name's ${remitterBank} account to their ${beneficiaryBank} account`,
//             async ({ pan }) => {
//               // Get remitter account (from remitter bank)
//               const remitterAccount = people[pan]![remitterBank];
//               // Get beneficiary account (from beneficiary bank)
//               const beneficiaryAccount = people[pan]![beneficiaryBank];

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

//               // Call the remitter's bank API (the bank that holds the remitter's account)
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
