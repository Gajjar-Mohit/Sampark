// Bank mapping for encoding/decoding
const BANK_CODES = {
  BRG: "01",
  CPB: "02",
  CMK: "03",
  PVB: "04",
} as const;

const BANK_REVERSE_MAP = Object.fromEntries(
  Object.entries(BANK_CODES).map(([bank, code]) => [code, bank])
);

export function generateTransactionId(
  bankCode: keyof typeof BANK_CODES = "BRG"
): string {
  const date = new Date();

  // Get bank numeric code
  const bankNumeric = BANK_CODES[bankCode];

  // Format date components with zero padding
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Generate 3-digit sequence number
  const sequence = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  // Combine all components
  const numericPart =
    bankNumeric + year + month + day + hours + minutes + sequence;

  return `TXN${numericPart}`;
}

export function decodeTransactionId(transactionId: string): {
  isValid: boolean;
  bankCode?: string;
  bankName?: string;
  timestamp?: Date;
  sequence?: string;
  details?: string;
} {
  // Check if it starts with TXN and has correct length (TXN + 2 bank + 2 year + 2 month + 2 day + 2 hours + 2 minutes + 3 sequence = 18)
  if (!transactionId.startsWith("TXN") || transactionId.length !== 18) {
    return { isValid: false };
  }

  const numericPart = transactionId.slice(3); // Remove 'TXN' prefix

  // Additional regex validation for numeric format
  if (!/^\d{15}$/.test(numericPart)) {
    return { isValid: false };
  }

  try {
    // Extract components
    const bankNumeric = numericPart.slice(0, 2);
    const yearStr = numericPart.slice(2, 4);
    const monthStr = numericPart.slice(4, 6);
    const dayStr = numericPart.slice(6, 8);
    const hoursStr = numericPart.slice(8, 10);
    const minutesStr = numericPart.slice(10, 12);
    const sequence = numericPart.slice(12, 15);

    const year = parseInt("20" + yearStr); // Add 20 prefix for full year
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    // Validate ranges
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hours) ||
      isNaN(minutes)
    ) {
      return { isValid: false };
    }

    const bankCode = BANK_REVERSE_MAP[bankNumeric];
    if (!bankCode) {
      return { isValid: false };
    }

    const timestamp = new Date(year, month - 1, day, hours, minutes, 0);

    // Additional check if the constructed date is valid (e.g., not Invalid Date)
    if (isNaN(timestamp.getTime())) {
      return { isValid: false };
    }

    return {
      isValid: true,
      bankCode: bankCode,
      bankName: getBankName(bankCode),
      timestamp: timestamp,
      sequence: sequence,
      details: `Bank: ${bankCode} (${getBankName(
        bankCode
      )}), Generated: ${timestamp.toLocaleString()}, Sequence: ${sequence}`,
    };
  } catch (error) {
    return { isValid: false };
  }
}

function getBankName(bankCode: string): string {
  const bankNames: Record<string, string> = {
    BRG: "Babu Rao Ganpatrao Bank",
    CPB: "Chai Pani Bank",
    CMK: "Chinta Mat Karo Bank",
    PVB: "Paisa Vasool Bank",
  };
  return bankNames[bankCode] || "Unknown Bank";
}