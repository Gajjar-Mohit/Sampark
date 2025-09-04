export function generateCardValidityDate(date = new Date(), yearsToAdd = 5) {
  const futureDate = new Date(date);
  futureDate.setFullYear(futureDate.getFullYear() + yearsToAdd);
  return futureDate;
}
