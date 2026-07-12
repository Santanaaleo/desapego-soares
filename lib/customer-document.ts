export function normalizeCustomerDocument(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function hasValidCheckDigits(document: string, weights: number[]) {
  const sum = weights.reduce((total, weight, index) => total + Number(document[index]) * weight, 0);
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;

  return checkDigit === Number(document[weights.length]);
}

export function isValidCustomerDocument(value: unknown) {
  const document = normalizeCustomerDocument(value);

  if (/^(\d)\1+$/.test(document)) return false;

  if (document.length === 11) {
    return hasValidCheckDigits(document, [10, 9, 8, 7, 6, 5, 4, 3, 2]) && hasValidCheckDigits(document, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  }

  if (document.length === 14) {
    return (
      hasValidCheckDigits(document, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) &&
      hasValidCheckDigits(document, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    );
  }

  return false;
}

export function formatCustomerDocument(value: string) {
  const document = normalizeCustomerDocument(value);

  if (document.length === 11) {
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (document.length === 14) {
    return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  return value;
}
