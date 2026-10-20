import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { getProfile, updateProfile, getMyRequirements } from '../src/controllers/orphanageController.js';
import { createRequirement, updateRequirement } from '../src/controllers/requirementController.js';
import { Orphanage } from '../src/models/Orphanage.js';
import { Requirement } from '../src/models/Requirement.js';

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

test('Orphanage Dashboard Backend Integration Tests', async (t) => {
  await connectDB();

  let targetOrphanage = await Orphanage.findOne();
  if (!targetOrphanage) {
    targetOrphanage = await Orphanage.create({
      name: "Hope Children's Home",
      type: "Children's Home / CCI",
      address: "12, Green Park Road, Coimbatore",
      contact: "+91 98765 43210",
      email: "hopehome.test@hopehaven.org",
      registrationNumber: `TN/CBE/TEST/${Date.now()}`,
      pan: "AAATH1234F",
      cciJj: "JJ-ACT-8842",
      authorizedPerson: "Dr. Revathi Sundaram",
      aadhaarNumberMasked: "XXXX XXXX 1234",
      aadhaarVerified: true,
      verificationStatus: "Approved",
    });
  }

  const mockUser = {
    _id: targetOrphanage.userId || targetOrphanage._id,
    id: targetOrphanage.userId || targetOrphanage._id,
    email: targetOrphanage.email,
    role: 'orphanage',
  };

  await t.test('GET /api/orphanages/me returns live orphanage profile', async () => {
    const req = { user: mockUser };
    const res = createMockResponse();

    await getProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data);
    assert.equal(res.body.data.name, targetOrphanage.name);
    assert.equal(res.body.data.email, targetOrphanage.email);
  });

  await t.test('PUT /api/orphanages/me updates live orphanage profile', async () => {
    const req = {
      user: mockUser,
      body: {
        address: 'Updated Address 999 Haven Road, Coimbatore',
        contact: '+91 99999 88888',
      },
    };
    const res = createMockResponse();

    await updateProfile(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.address, 'Updated Address 999 Haven Road, Coimbatore');
    assert.equal(res.body.data.contact, '+91 99999 88888');

    // Confirm in DB
    const refreshed = await Orphanage.findById(targetOrphanage._id);
    assert.equal(refreshed.address, 'Updated Address 999 Haven Road, Coimbatore');
  });

  let createdReqId = null;

  await t.test('POST /api/requirements posts a new requirement for the orphanage', async () => {
    const req = {
      user: mockUser,
      body: {
        title: 'Emergency Medicines Restock',
        category: 'Healthcare',
        amountNeeded: 20000,
        urgency: 'Critical',
        orphanageId: targetOrphanage._id,
      },
    };
    const res = createMockResponse();

    await createRequirement(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data._id);
    createdReqId = res.body.data._id.toString();
  });

  await t.test('GET /api/orphanages/me/requirements retrieves requirements for this orphanage', async () => {
    const req = { user: mockUser };
    const res = createMockResponse();

    await getMyRequirements(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.some((r) => r.title === 'Emergency Medicines Restock'));
  });

  await t.test('PUT /api/requirements/:id edits requirement and marks it fulfilled', async () => {
    assert.ok(createdReqId, 'A requirement should have been created in prior test');

    // 1. Edit requirement details
    const reqEdit = {
      params: { id: createdReqId },
      body: {
        title: 'Emergency Pediatric Medicines Restock (Updated)',
        amountNeeded: 22000,
      },
    };
    const resEdit = createMockResponse();
    await updateRequirement(reqEdit, resEdit, () => {});
    assert.equal(resEdit.statusCode, 200);
    assert.equal(resEdit.body.data.title, 'Emergency Pediatric Medicines Restock (Updated)');
    assert.equal(resEdit.body.data.amountNeeded, 22000);

    // 2. Mark requirement fulfilled
    const reqFulfill = {
      params: { id: createdReqId },
      body: {
        status: 'fulfilled',
      },
    };
    const resFulfill = createMockResponse();
    await updateRequirement(reqFulfill, resFulfill, () => {});
    assert.equal(resFulfill.statusCode, 200);
    assert.equal(resFulfill.body.data.status, 'fulfilled');
    assert.equal(resFulfill.body.data.amountRaised, 22000);

    // Cleanup created requirement
    await Requirement.findByIdAndDelete(createdReqId);
  });

  await disconnectDB();
});
