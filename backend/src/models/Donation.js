/**
 * Donation Model / Schema Definition
 * Represents financial contributions from supporters to orphanages or specific requirements.
 */

export const DonationStatus = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
};

export const PaymentMethods = [
  'UPI / PhonePe',
  'UPI / GPay',
  'Net Banking',
  'Credit Card',
];

export const DonationSchema = {
  id: 'String (e.g. RCP-2026-0042)',       // Receipt Identifier
  donorId: 'Reference to User (nullable if anonymous)',
  orphanageId: 'Reference to Orphanage',
  requirementId: 'Reference to Requirement (optional)',
  donorName: { type: 'String', default: 'Anonymous' },
  donorEmail: { type: 'String', default: null },
  amount: { type: 'Number', required: true, min: 1 },
  date: { type: 'Date', default: 'Date.now' },
  status: { 
    type: 'String', 
    enum: Object.values(DonationStatus), 
    default: DonationStatus.COMPLETED 
  },
  showDonor: { type: 'Boolean', default: true },
  paymentMethod: { type: 'String', enum: PaymentMethods, required: true },
  transactionId: { type: 'String', default: null }, // Gateway order/payment ID
  taxPan: { type: 'String', default: null },        // For 80G tax benefit receipt
  createdAt: 'Date',
  updatedAt: 'Date',
};
