import { describe, expect, it } from "vitest";
import {
  isMpesaMethod,
  isValidKenyanPhone,
  MPESA_PAYMENT_METHOD_TYPE,
  normalizeKenyanPhone,
} from "@/lib/utils/mpesa";

describe("isMpesaMethod", () => {
  it("matches the Spree M-Pesa payment method type", () => {
    expect(isMpesaMethod(MPESA_PAYMENT_METHOD_TYPE)).toBe(true);
  });

  it("rejects other payment method types", () => {
    expect(isMpesaMethod("Spree::PaymentMethod::StripeGateway")).toBe(false);
  });
});

describe("normalizeKenyanPhone", () => {
  it("converts a local 0-prefixed number to 254 format", () => {
    expect(normalizeKenyanPhone("0712345678")).toBe("254712345678");
  });

  it("prefixes a bare 9-digit number with 254", () => {
    expect(normalizeKenyanPhone("712345678")).toBe("254712345678");
  });

  it("accepts an already-normalized 254 number", () => {
    expect(normalizeKenyanPhone("254712345678")).toBe("254712345678");
  });

  it("strips spaces and the plus from a +254 number", () => {
    expect(normalizeKenyanPhone("+254 712 345 678")).toBe("254712345678");
  });

  it("normalizes a +254 number that also includes the trunk 0", () => {
    expect(normalizeKenyanPhone("+254 0712 345 678")).toBe("254712345678");
  });

  it("returns an empty string for an unrecognized number", () => {
    expect(normalizeKenyanPhone("12345")).toBe("");
  });
});

describe("isValidKenyanPhone", () => {
  it("is true for a normalizable number", () => {
    expect(isValidKenyanPhone("0712345678")).toBe(true);
  });

  it("is false for an unrecognized number", () => {
    expect(isValidKenyanPhone("12345")).toBe(false);
  });
});
