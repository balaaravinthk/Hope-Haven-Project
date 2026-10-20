import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { createDonation, getDonations, getReceipt } from '../src/controllers/donationController.js';
import { Donation } from '../src/models/Donation.js';
import { Requirement, RequirementStatus } from '../src/models/Requirement.js';
import { Orphanage } from '../src/models/Orphanage.js';

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

test('Full Donation Flow Integration Tests', async (t) => {
  await connectDB();

  let orphanage = await Orphanage.findOne();
  if (!orphanage) {
    orphanage = await Orphanage.create({
      name: "Hope Children's Home",
      type: "Children's Home / CCI",
      address: "12, Green Park Road, Coimbatore",
      contact: "+91 98765 43210",
      email: `orphanage.donation.${Date.now()}@hopehaven.test`,
      registrationNumber: `REG-DON-${Date.now()}`,
      pan: "AAATH1234F",
      cciJj: "JJ-ACT-8842",
      authorizedPerson: "Dr. Revathi Sundaram",
      aadhaarNumberMasked: "XXXX XXXX 1234",
      aadhaarVerified: true,
      verificationStatus: "Approved",
    });
  }

  // Create a dedicated test requirement to verify atomic increment
  const requirement = await Requirement.create({
    orphanageId: orphanage._id,
    title: 'Urgent Baby Formula & Nutritional Milk',
    category: 'Food & Nutrition',
    amountNeeded: 10000,
    amountRaised: 2000,
    status: RequirementStatus.ACTIVE,
  });

  let generatedReceiptId = null;

  await t.test('POST /api/donations creates donation, formats HH-2026-XXXXX, and increments amountRaised', async () => {
    const req = {
      body: {
        orphanageId: orphanage._id.toString(),
        requirementId: requirement._id.toString(),
        amount: 3000,
        donorName: 'Aarav Sharma',
        donorEmail: 'aarav@test.org',
        paymentMethod: 'UPI / PhonePe',
        taxPan: 'AARAV1234A',
        showDonor: true,
      },
    };
    const res = createMockResponse();

    await createDonation(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.receiptId);
    assert.match(res.body.data.receiptId, /^HH-\d{4}-\d{5}$/, 'Receipt ID should match HH-YYYY-XXXXX format');
    generatedReceiptId = res.body.data.receiptId;

    // Verify requirement in MongoDB was atomically incremented from 2000 to 5000
    const updatedReq = await Requirement.findById(requirement._id);
    assert.equal(updatedReq.amountRaised, 5000, 'amountRaised should increment by 3000 to 5000');
    assert.equal(updatedReq.status, RequirementStatus.ACTIVE);

    // Verify donation record in MongoDB
    const dbDonation = await Donation.findOne({ receiptId: generatedReceiptId });
    assert.ok(dbDonation);
    assert.equal(dbDonation.amount, 3000);
    assert.equal(dbDonation.donorName, 'Aarav Sharma');
    assert.equal(dbDonation.taxPan, 'AARAV1234A');
    assert.equal(dbDonation.paymentMethod, 'UPI / PhonePe');
  });

  await t.test('POST /api/donations marks requirement fulfilled when target reached', async () => {
    // Donate remaining 5000 to reach 10000 needed
    const req = {
      body: {
        orphanageId: orphanage._id.toString(),
        requirementId: requirement._id.toString(),
        amount: 5000,
        donorName: 'Kavitha M.',
        paymentMethod: 'Net Banking',
        showDonor: true,
      },
    };
    const res = createMockResponse();

    await createDonation(req, res, () => {});

    assert.equal(res.statusCode, 201);

    const fulfilledReq = await Requirement.findById(requirement._id);
    assert.equal(fulfilledReq.amountRaised, 10000);
    assert.equal(fulfilledReq.status, RequirementStatus.FULFILLED, 'Should mark status fulfilled');
  });

  await t.test('GET /api/donations returns ledger records with populated institutions', async () => {
    const req = { query: {} };
    const res = createMockResponse();

    await getDonations(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.some((d) => d.id === generatedReceiptId));
  });

  await t.test('GET /api/donations/receipt/:receiptId returns official 80G tax receipt metadata', async () => {
    assert.ok(generatedReceiptId);
    const req = { params: { receiptId: generatedReceiptId } };
    const res = createMockResponse();

    await getReceipt(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, generatedReceiptId);
    assert.ok(res.body.data.institution);
    assert.equal(res.body.data.institution.name, orphanage.name);
    assert.ok(res.body.data.taxExemptionSection.includes('80G'));
  });

  // Cleanup
  await Requirement.findByIdAndDelete(requirement._id);
  await Donation.deleteMany({ receiptId: generatedReceiptId });

  await disconnectDB();
});
