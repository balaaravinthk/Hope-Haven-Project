/**
 * Formatting and Masking Utility Helpers
 */

export function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function maskMobile(mobile) {
  const digits = String(mobile).replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `******${digits.slice(-4)}`;
}

export function maskAadhaar(aadhaar) {
  const digits = String(aadhaar).replace(/\D/g, '');
  if (digits.length !== 12) return '**** **** ****';
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function generateReceiptId() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${year}-${randomSuffix}`;
}
