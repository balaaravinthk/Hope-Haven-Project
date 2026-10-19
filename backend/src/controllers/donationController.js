import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { generateReceiptId } from '../utils/formatters.js';

let donations = [
  {
    id: 'RCP-2026-0042',
    donor: 'Kavitha M.',
    amount: 5000,
    date: '2026-10-14',
    status: 'Completed',
    showDonor: true,
    paymentMethod: 'UPI / PhonePe',
  },
  {
    id: 'RCP-2026-0041',
    donor: 'Anonymous Donor',
    amount: 10000,
    date: '2026-10-12',
    status: 'Completed',
    showDonor: false,
    paymentMethod: 'Net Banking',
  },
  {
    id: 'RCP-2026-0040',
    donor: 'Suresh Kumar',
    amount: 2500,
    date: '2026-10-10',
    status: 'Completed',
    showDonor: true,
    paymentMethod: 'Credit Card',
  },
];

export const getDonations = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Donation ledger fetched', donations);
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (req, res, next) => {
  try {
    const { donorName, amount, showDonor, paymentMethod, taxPan } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'A valid donation amount is required', null, 400);
    }

    const receiptId = generateReceiptId();
    const newDonation = {
      id: receiptId,
      donor: showDonor ? (donorName || 'Generous Supporter') : 'Anonymous Donor',
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      showDonor: !!showDonor,
      paymentMethod: paymentMethod || 'UPI / PhonePe',
      taxPan: taxPan || null,
    };

    donations.unshift(newDonation);
    return sendSuccess(res, 'Donation processed successfully', newDonation, 201);
  } catch (error) {
    next(error);
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const { receiptId } = req.params;
    const donation = donations.find((d) => d.id === receiptId);

    if (!donation) {
      return sendError(res, 'Receipt not found', null, 404);
    }

    const receiptData = {
      ...donation,
      institution: {
        name: "Hope Children's Home",
        address: "124 Peace Haven Road, Saravanampatti, Coimbatore, Tamil Nadu 641035",
        pan: "AAATH1234F",
        regNo: "TN/CBE/2018/00492",
        authorizedSignatory: "Dr. Revathi Sundaram",
      },
      taxExemptionNote: "Donations are eligible for tax exemption under Section 80G of the Income Tax Act.",
    };

    return sendSuccess(res, 'Receipt details fetched', receiptData);
  } catch (error) {
    next(error);
  }
};
