export function generateBankAccountNumber() {
  const length = 12;
  if (length <= 0) {
    return "";
  }

  let accountNumber = "";
  for (let i = 0; i < length; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    accountNumber += randomDigit.toString();
  }
  return accountNumber;
}

