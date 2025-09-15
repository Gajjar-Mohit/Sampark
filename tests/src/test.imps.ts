import axios from "axios";
import { file } from "bun"; // Using Bun's file reader

/**
 * Finds and returns the first account for a given bank code.
 * @param allAccounts - The array of all user accounts.
 * @param bankCode - The bank code to search for (e.g., "BRG", "CPB").
 * @returns The first matching account object, or undefined if not found.
 */
function findAccountByBank(allAccounts: any[], bankCode: string) {
  return allAccounts.find((account) => account.ifscCode.includes(bankCode));
}

/**
 * Initiates an IMPS transfer request to the remitter's bank.
 * @param transferData - The payload for the IMPS transfer.
 * @returns The response from the server.
 */
async function initiateIMPSTransfer(transferData: any) {
  // This function remains the same, sending the request to the remitter's bank.
  const config = {
    method: "post",
    url: "http://localhost:3001/api/v1/imps/initiate", // Hardcoded to BRG bank as per original script
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(transferData),
  };

  const response = await axios.request(config);
  return response;
}

/**
 * Main function to run the IMPS transfer test using accounts from JSON.
 */
async function runImpsTestFromJson() {
  try {
    // 1. Read and parse the JSON file
    console.log("Reading from userAccounts.json...");
    const fileContent = await file("userAccounts.json").text();
    const allAccounts = JSON.parse(fileContent);

    // 2. Find a remitter account from BRG bank (:3001)
    const remitterAccount = findAccountByBank(allAccounts, "BRG");

    // 3. Find a beneficiary account from CPB bank (:3002)
    const beneficiaryAccount = findAccountByBank(allAccounts, "CPB");

    // 4. Check if accounts were found
    if (!remitterAccount || !beneficiaryAccount) {
      throw new Error(
        "Could not find a suitable remitter (BRG) or beneficiary (CPB) account in userAccounts.json"
      );
    }

    console.log(
      `Found Remitter: ${remitterAccount.accountHolderName} (${remitterAccount.ifscCode})`
    );
    console.log(
      `Found Beneficiary: ${beneficiaryAccount.accountHolderName} (${beneficiaryAccount.ifscCode})`
    );

    // 5. Prepare the IMPS transfer data
    const impsData = {
      beneficiaryAccountNo: beneficiaryAccount.accountNo,
      beneficiaryMobileNo: beneficiaryAccount.accountHolderContactNo,
      beneficiaryMMID: "",
      benificiaryIFSCode: beneficiaryAccount.ifscCode,
      amount: "222", // Amount from the original script
      remitterAccountNo: remitterAccount.accountNo,
      remitterMobileNo: remitterAccount.accountHolderContactNo,
      remitterMMID: "",
      remitterIFSCode: remitterAccount.ifscCode,
    };

    // 6. Initiate the transfer
    console.log("\nInitiating IMPS transfer...");
    const response = await initiateIMPSTransfer(impsData);

    console.log("\n✅ Transfer successful!");
    console.log("Response data:", response.data);
  } catch (error: any) {
    console.error("\n❌ An error occurred during the IMPS transfer test.");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error Data:", error.response.data);
      console.error("Error Status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error Message:", error.message);
    }
  }
}

// Run the main function
runImpsTestFromJson();
