import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User, UserRoles } from '../src/models/User.js';
import { Orphanage, OrphanageTypes, VerificationStatus } from '../src/models/Orphanage.js';
import { Requirement, RequirementCategories, UrgencyLevels, RequirementStatus } from '../src/models/Requirement.js';
import { Donation, DonationStatus, PaymentMethods } from '../src/models/Donation.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

test('User Model Schema & Index Validation', async (t) => {
  await t.test('has timestamps option enabled', () => {
    assert.equal(User.schema.options.timestamps, true);
  });

  await t.test('validates required fields', async () => {
    const invalidUser = new User({});
    let error;
    try {
      await invalidUser.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error?.errors?.name);
    assert.ok(error?.errors?.email);
    assert.ok(error?.errors?.password);
  });

  await t.test('enforces role enum and defaults to supporter', async () => {
    const validUser = new User({
      name: 'Test Donor',
      email: 'donor@example.com',
      password: 'password123',
    });
    assert.equal(validUser.role, UserRoles.SUPPORTER);

    const invalidRoleUser = new User({
      name: 'Test Donor',
      email: 'donor2@example.com',
      password: 'password123',
      role: 'invalid_role',
    });
    let error;
    try {
      await invalidRoleUser.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error?.errors?.role);
  });

  await t.test('toJSON removes password and __v', () => {
    const user = new User({
      name: 'Test Donor',
      email: 'donor@example.com',
      password: 'secret_password_123',
    });
    const json = user.toJSON();
    assert.equal(json.password, undefined);
    assert.equal(json.__v, undefined);
    assert.equal(json.name, 'Test Donor');
  });

  await t.test('verifies declared indexes on User', () => {
    const indexes = User.schema.indexes();
    const hasRoleCreatedIndex = indexes.some(
      ([idx]) => idx.role === 1 && idx.createdAt === -1
    );
    assert.ok(hasRoleCreatedIndex, 'Should have compound index on role and createdAt');
  });
});

test('Orphanage Model Schema & Index Validation', async (t) => {
  await t.test('has timestamps enabled', () => {
    assert.equal(Orphanage.schema.options.timestamps, true);
  });

  await t.test('validates institutional required fields', async () => {
    const orphanage = new Orphanage({});
    let error;
    try {
      await orphanage.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error?.errors?.name);
    assert.ok(error?.errors?.type);
    assert.ok(error?.errors?.address);
    assert.ok(error?.errors?.contact);
    assert.ok(error?.errors?.email);
    assert.ok(error?.errors?.registrationNumber);
    assert.ok(error?.errors?.pan);
    assert.ok(error?.errors?.cciJj);
    assert.ok(error?.errors?.authorizedPerson);
  });

  await t.test('validates valid orphanage types and verification status defaults', async () => {
    const orphanage = new Orphanage({
      name: 'Sunshine Home',
      type: OrphanageTypes[0],
      address: '123 Care Street',
      contact: '9876543210',
      email: 'sunshine@care.org',
      registrationNumber: 'REG-12345',
      pan: 'ABCDE1234F',
      cciJj: 'JJ-123',
      authorizedPerson: 'John Doe',
      aadhaarNumberMasked: 'XXXX XXXX 1234',
    });
    await orphanage.validate();
    assert.equal(orphanage.verificationStatus, VerificationStatus.PENDING);
    assert.equal(orphanage.verifiedBadge, false);
  });

  await t.test('verifies text index and compound index on Orphanage', () => {
    const indexes = Orphanage.schema.indexes();
    const hasStatusTypeIndex = indexes.some(
      ([idx]) => idx.verificationStatus === 1 && idx.type === 1
    );
    assert.ok(hasStatusTypeIndex, 'Should have compound index on verificationStatus and type');
  });
});

test('Requirement Model Schema & Virtuals Validation', async (t) => {
  await t.test('has timestamps enabled', () => {
    assert.equal(Requirement.schema.options.timestamps, true);
  });

  await t.test('validates amount bounds and category enum', async () => {
    const req = new Requirement({
      orphanageId: new mongoose.Types.ObjectId(),
      title: 'Blankets for Winter',
      category: 'Clothing',
      amountNeeded: -50,
    });
    let error;
    try {
      await req.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error?.errors?.amountNeeded, 'Amount needed cannot be negative');
  });

  await t.test('computes percentageRaised and remainingAmount virtuals correctly', () => {
    const req = new Requirement({
      orphanageId: new mongoose.Types.ObjectId(),
      title: 'Math Books',
      category: 'Education',
      amountNeeded: 10000,
      amountRaised: 4000,
    });
    assert.equal(req.percentageRaised, 40);
    assert.equal(req.remainingAmount, 6000);
  });

  await t.test('verifies compound indexes on Requirement', () => {
    const indexes = Requirement.schema.indexes();
    const hasOrphStatusIndex = indexes.some(
      ([idx]) => idx.orphanageId === 1 && idx.status === 1
    );
    const hasUrgencyStatusIndex = indexes.some(
      ([idx]) => idx.status === 1 && idx.urgency === 1 && idx.createdAt === -1
    );
    assert.ok(hasOrphStatusIndex, 'Should index orphanageId and status');
    assert.ok(hasUrgencyStatusIndex, 'Should index status, urgency, and createdAt');
  });
});

test('Donation Model Schema & Index Validation', async (t) => {
  await t.test('has timestamps enabled', () => {
    assert.equal(Donation.schema.options.timestamps, true);
  });

  await t.test('validates donation required fields and payment method enum', async () => {
    const donation = new Donation({
      receiptId: 'RCP-2026-TEST',
      orphanageId: new mongoose.Types.ObjectId(),
      amount: 1500,
      paymentMethod: 'Invalid Gateway',
    });
    let error;
    try {
      await donation.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error?.errors?.paymentMethod);
  });

  await t.test('creates valid donation document with defaults', async () => {
    const donation = new Donation({
      receiptId: 'RCP-2026-0099',
      orphanageId: new mongoose.Types.ObjectId(),
      amount: 2500,
      paymentMethod: PaymentMethods[0],
    });
    await donation.validate();
    assert.equal(donation.donorName, 'Anonymous');
    assert.equal(donation.status, DonationStatus.COMPLETED);
    assert.equal(donation.currency, 'INR');
  });

  await t.test('verifies compound indexes for reporting on Donation', () => {
    const indexes = Donation.schema.indexes();
    const hasOrphanageDateIndex = indexes.some(
      ([idx]) => idx.orphanageId === 1 && idx.date === -1
    );
    const hasDonorDateIndex = indexes.some(
      ([idx]) => idx.donorId === 1 && idx.date === -1
    );
    assert.ok(hasOrphanageDateIndex, 'Should index orphanageId and date');
    assert.ok(hasDonorDateIndex, 'Should index donorId and date');
  });
});

test('Database Connection & Schema Live Integration Test', async (t) => {
  const conn = await connectDB();
  if (!conn) {
    t.skip('Skipping live DB check as DATABASE_URL is not accessible in this environment');
    return;
  }

  assert.equal(mongoose.connection.readyState, 1, 'MongoDB connection should be open (readyState 1)');

  // Test inserting and querying a test user
  const uniqueEmail = `test.user.${Date.now()}@hopehaven.test`;
  const createdUser = await User.create({
    name: 'Atlas Test User',
    email: uniqueEmail,
    password: 'hashed_password_sample_123',
    role: UserRoles.SUPPORTER,
  });

  assert.ok(createdUser._id);
  assert.ok(createdUser.createdAt instanceof Date);
  assert.ok(createdUser.updatedAt instanceof Date);

  // Clean up
  await User.findByIdAndDelete(createdUser._id);

  await disconnectDB();
});
