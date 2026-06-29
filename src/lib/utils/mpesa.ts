export const MPESA_PAYMENT_METHOD_TYPE = "Spree::PaymentMethod::Mpesa";

export function isMpesaMethod(paymentMethodType: string): boolean {
  return paymentMethodType === MPESA_PAYMENT_METHOD_TYPE;
}

export function normalizeKenyanPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");

  if (/^0[17]\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }
  if (/^[17]\d{8}$/.test(digits)) {
    return `254${digits}`;
  }
  if (/^254[17]\d{8}$/.test(digits)) {
    return digits;
  }
  return "";
}

export function isValidKenyanPhone(raw: string): boolean {
  return normalizeKenyanPhone(raw).length > 0;
}
