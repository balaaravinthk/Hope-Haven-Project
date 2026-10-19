import { validateAadhaar } from '../utils/verhoeff.js';

// In-memory OTP store for simulated demo / development
const otpStore = new Map();

/**
 * Validates Aadhaar via Verhoeff checksum and generates a verification OTP
 */
export const initiateAadhaarKyc = (aadhaarNumber, mobile) => {
  if (!validateAadhaar(aadhaarNumber)) {
    throw new Error('Invalid Aadhaar number format or Verhoeff checksum failed.');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const cleanAadhaar = String(aadhaarNumber).replace(/\D/g, '');

  otpStore.set(cleanAadhaar, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
  });

  return {
    success: true,
    message: 'OTP sent to mobile linked with Aadhaar.',
    simulatedOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  };
};

/**
 * Verifies submitted OTP against store
 */
export const verifyAadhaarOtp = (aadhaarNumber, submittedOtp) => {
  const cleanAadhaar = String(aadhaarNumber).replace(/\D/g, '');
  const record = otpStore.get(cleanAadhaar);

  if (!record) {
    throw new Error('No OTP request found for this Aadhaar number.');
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanAadhaar);
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (record.otp !== String(submittedOtp).trim()) {
    throw new Error('Invalid OTP. Please check the code and try again.');
  }

  otpStore.delete(cleanAadhaar);
  return true;
};
