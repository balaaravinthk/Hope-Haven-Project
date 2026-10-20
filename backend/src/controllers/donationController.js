import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { Donation, DonationStatus, PaymentMethods } from '../models/Donation.js';
import { Requirement, RequirementStatus } from '../models/Requirement.js';
import { Orphanage } from '../models/Orphanage.js';
import { User } from '../models/User.js';

/**
 * Generate official receipt ID in the format: HH-YYYY-XXXXX
 */
export const generateReceiptId = () => {
  const year = new Date().getFullYear();
  const randomSerial = Math.floor(10000 + Math.random() * 90000);
  return `HH-${year}-${randomSerial}`;
};

/**
 * Seed initial mock donations into MongoDB if collection is empty
 */
const ensureSeedDonations = async () => {
  try {
    const count = await Donation.countDocuments();
    if (count > 0) return;

    const defaultOrphanage = await Orphanage.findOne();
    const defaultRequirement = await Requirement.findOne();

    if (!defaultOrphanage) return;

    const seedList = [
      {
        receiptId: `HH-${new Date().getFullYear()}-84921`,
        orphanageId: defaultOrphanage._id,
        requirementId: defaultRequirement?._id || null,
        donorName: 'Kavitha M.',
        amount: 5000,
        showDonor: true,
        paymentMethod: 'UPI / PhonePe',
        status: DonationStatus.COMPLETED,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        taxPan: 'ABCPM1234K',
        transactionId: `TXN_UPI_${Date.now()}_1`,
      },
      {
        receiptId: `HH-${new Date().getFullYear()}-71204`,
        orphanageId: defaultOrphanage._id,
        requirementId: defaultRequirement?._id || null,
        donorName: 'Anonymous Donor',
        amount: 10000,
        showDonor: false,
        paymentMethod: 'Net Banking',
        status: DonationStatus.COMPLETED,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        transactionId: `TXN_NET_${Date.now()}_2`,
      },
      {
        receiptId: `HH-${new Date().getFullYear()}-63489`,
        orphanageId: defaultOrphanage._id,
        requirementId: defaultRequirement?._id || null,
        donorName: 'Suresh Kumar',
        amount: 2500,
        showDonor: true,
        paymentMethod: 'Credit Card',
        status: DonationStatus.COMPLETED,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        taxPan: 'XYZPK5678L',
        transactionId: `TXN_CC_${Date.now()}_3`,
      },
    ];

    await Donation.insertMany(seedList);
  } catch (err) {
    console.warn('⚠️  Could not seed initial donations:', err.message);
  }
};

/**
 * GET /api/donations
 * Retrieves donation ledger with populated orphanage & requirement details
 */
export const getDonations = async (req, res, next) => {
  try {
    await ensureSeedDonations();

    const query = {};
    if (req.query.orphanageId) {
      query.orphanageId = req.query.orphanageId;
    }

    const rawDonations = await Donation.find(query)
      .populate('orphanageId', 'name address contact email pan registrationNumber authorizedPerson')
      .populate('requirementId', 'title category amountNeeded amountRaised status')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const formatted = rawDonations.map((d) => ({
      ...d,
      id: d.receiptId,
      donor: d.showDonor ? d.donorName : 'Anonymous Donor',
      orphanageName: d.orphanageId?.name || "Hope Children's Home",
      requirementTitle: d.requirementId?.title || null,
      date: d.date ? new Date(d.date).toISOString().split('T')[0] : 'Today',
    }));

    return sendSuccess(res, 'Donation ledger fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/donations
 * 
 * 1. Generates receiptId (format HH-YYYY-XXXXX)
 * 2. Saves Donation record in MongoDB
 * 3. Atomically increments requirement amountRaised in MongoDB
 * 4. Updates donor's totalDonated impact stats if authenticated
 */
export const createDonation = async (req, res, next) => {
  try {
    const {
      orphanageId,
      requirementId,
      amount,
      donorName,
      donorEmail,
      showDonor,
      paymentMethod,
      taxPan,
    } = req.body;

    const donationAmount = Number(amount);
    if (!donationAmount || donationAmount <= 0) {
      return sendError(res, 'A valid donation amount greater than 0 is required.', null, 400);
    }

    // 1. Resolve Orphanage ID
    let resolvedOrphanageId = orphanageId;
    if (!resolvedOrphanageId && requirementId) {
      const targetReq = await Requirement.findById(requirementId);
      if (targetReq) {
        resolvedOrphanageId = targetReq.orphanageId;
      }
    }

    if (!resolvedOrphanageId) {
      const defaultOrph = await Orphanage.findOne();
      resolvedOrphanageId = defaultOrph?._id;
    }

    if (!resolvedOrphanageId) {
      return sendError(res, 'Orphanage reference is required to record donation.', null, 400);
    }

    // 2. Generate Receipt ID: HH-2026-XXXXX
    const receiptId = generateReceiptId();

    // 3. Resolve donor info
    const donorId = req.user?._id || req.user?.id || null;
    const isAnonymous = showDonor === false || showDonor === 'false';
    const finalDonorName = isAnonymous
      ? 'Anonymous Supporter'
      : (donorName || req.user?.name || 'Generous Donor').trim();

    // 4. Save Donation record in MongoDB
    const newDonation = await Donation.create({
      receiptId,
      donorId,
      orphanageId: resolvedOrphanageId,
      requirementId: requirementId || null,
      donorName: finalDonorName,
      donorEmail: donorEmail || req.user?.email || null,
      amount: donationAmount,
      showDonor: !isAnonymous,
      paymentMethod: paymentMethod || 'UPI / PhonePe',
      taxPan: taxPan ? taxPan.trim().toUpperCase() : null,
      transactionId: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      status: DonationStatus.COMPLETED,
      date: new Date(),
    });

    // 5. Increment Requirement amountRaised in MongoDB
    let updatedRequirement = null;
    if (requirementId) {
      const existingReq = await Requirement.findById(requirementId);
      if (existingReq) {
        const newRaised = (existingReq.amountRaised || 0) + donationAmount;
        const newStatus =
          newRaised >= existingReq.amountNeeded ? RequirementStatus.FULFILLED : existingReq.status;

        updatedRequirement = await Requirement.findByIdAndUpdate(
          requirementId,
          {
            $inc: { amountRaised: donationAmount },
            status: newStatus,
          },
          { returnDocument: 'after' }
        );
      }
    }

    // 6. Update User's impact in MongoDB if authenticated
    if (donorId) {
      await User.findByIdAndUpdate(donorId, {
        $inc: { 'impact.totalDonated': donationAmount },
      }).catch(() => {});
    }

    // Populate created donation for immediate receipt response
    const populated = await Donation.findById(newDonation._id)
      .populate('orphanageId', 'name address contact email pan registrationNumber authorizedPerson')
      .populate('requirementId', 'title category amountNeeded amountRaised status')
      .lean();

    return sendSuccess(
      res,
      'Donation processed successfully. Thank you for your support!',
      {
        donation: {
          ...populated,
          id: populated.receiptId,
          donor: populated.donorName,
        },
        receiptId,
        updatedRequirement,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/donations/receipt/:receiptId
 * Fetches full receipt details with 80G tax certificate attributes
 */
export const getReceipt = async (req, res, next) => {
  try {
    const { receiptId } = req.params;

    let donation = await Donation.findOne({ receiptId })
      .populate('orphanageId')
      .populate('requirementId')
      .lean();

    if (!donation) {
      return sendError(res, 'Receipt not found', null, 404);
    }

    const orph = donation.orphanageId || {};

    const receiptData = {
      ...donation,
      id: donation.receiptId,
      donor: donation.showDonor ? donation.donorName : 'Anonymous Donor',
      taxExemptionSection: "Section 80G (50% Exemption)",
      institution: {
        name: orph.name || "Hope Children's Home",
        address: orph.address || "12, Green Park Road, Coimbatore, Tamil Nadu",
        pan: orph.pan || "AAATH1234F",
        regNo: orph.registrationNumber || "TN/CBE/2018/00492",
        authorizedSignatory: orph.authorizedPerson || "Dr. Revathi Sundaram",
        taxExemptionSection: "Section 80G (50% Exemption)",
        taxExemptionNumber: "AAATH1234F20261",
      },
      taxExemptionNote:
        "Donations made to Hope Haven verified Child Care Institutions are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.",
    };

    return sendSuccess(res, 'Receipt details fetched successfully', receiptData);
  } catch (error) {
    next(error);
  }
};
