import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { User, UserRoles } from '../src/models/User.js';
import { register, login, getMe } from '../src/controllers/authController.js';
import { authenticate } from '../src/middlewares/authMiddleware.js';
import { authorizeRoles } from '../src/middlewares/roleMiddleware.js';
import { hashPassword, comparePassword, generateTokens } from '../src/services/authService.js';

// Helper to create mock Express response
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

test('Authentication Engine & Security Tests', async (t) => {
  // Connect to DB before tests
  await connectDB();

  const testEmailSupporter = `test.supporter.${Date.now()}@hopehaven.test`;
  const testEmailOrphanage = `test.orphanage.${Date.now()}@hopehaven.test`;
  const rawPassword = 'SecurePassword123!';

  await t.test('Password Hashing & Token Generation Service', async () => {
    const hashed = await hashPassword(rawPassword);
    assert.notEqual(hashed, rawPassword);
    assert.ok(await bcrypt.compare(rawPassword, hashed));
    assert.ok(await comparePassword(rawPassword, hashed));
    assert.equal(await comparePassword('WrongPassword', hashed), false);

    const tokens = generateTokens({ id: 'usr_123', email: 'test@example.com', role: 'supporter' });
    assert.ok(tokens.accessToken);
    assert.ok(tokens.refreshToken);

    const decoded = jwt.verify(tokens.accessToken, env.JWT_SECRET);
    assert.equal(decoded.id, 'usr_123');
    assert.equal(decoded.email, 'test@example.com');
    assert.equal(decoded.role, 'supporter');
  });

  await t.test('Register Controller: Success & Validations', async () => {
    // 1. Missing fields should return 400
    const reqEmpty = { body: {} };
    const resEmpty = createMockResponse();
    await register(reqEmpty, resEmpty, () => {});
    assert.equal(resEmpty.statusCode, 400);
    assert.equal(resEmpty.body.success, false);

    // 2. Short password should return 400
    const reqShortPass = { body: { name: 'Short', email: 'short@test.com', password: '123' } };
    const resShortPass = createMockResponse();
    await register(reqShortPass, resShortPass, () => {});
    assert.equal(resShortPass.statusCode, 400);
    assert.equal(resShortPass.body.success, false);

    // 3. Valid Registration should return 201
    const reqValid = {
      body: {
        name: 'Bala Supporter',
        email: testEmailSupporter,
        password: rawPassword,
        role: UserRoles.SUPPORTER,
      },
    };
    const resValid = createMockResponse();
    await register(reqValid, resValid, () => {});
    assert.equal(resValid.statusCode, 201);
    assert.equal(resValid.body.success, true);
    assert.ok(resValid.body.data.accessToken);
    assert.ok(resValid.body.data.refreshToken);
    assert.equal(resValid.body.data.user.email, testEmailSupporter.toLowerCase());
    assert.equal(resValid.body.data.user.password, undefined, 'Password must not be in response body');

    // Verify stored user in DB has hashed password
    const dbUser = await User.findOne({ email: testEmailSupporter.toLowerCase() });
    assert.ok(dbUser);
    assert.notEqual(dbUser.password, rawPassword);
    assert.ok(await comparePassword(rawPassword, dbUser.password));

    // 4. Duplicate email registration should return 409
    const reqDuplicate = {
      body: {
        name: 'Duplicate Bala',
        email: testEmailSupporter,
        password: rawPassword,
      },
    };
    const resDuplicate = createMockResponse();
    await register(reqDuplicate, resDuplicate, () => {});
    assert.equal(resDuplicate.statusCode, 409);
    assert.equal(resDuplicate.body.success, false);

    // Register an orphanage user for role tests
    const reqOrph = {
      body: {
        name: 'Hope Home Admin',
        email: testEmailOrphanage,
        password: rawPassword,
        role: UserRoles.ORPHANAGE_ADMIN,
      },
    };
    const resOrph = createMockResponse();
    await register(reqOrph, resOrph, () => {});
    assert.equal(resOrph.statusCode, 201);
  });

  await t.test('Login Controller: Password & Role Verification', async () => {
    // 1. Missing credentials returns 400
    const reqMissing = { body: {} };
    const resMissing = createMockResponse();
    await login(reqMissing, resMissing, () => {});
    assert.equal(resMissing.statusCode, 400);

    // 2. Non-existent email returns 401
    const reqNoUser = { body: { email: 'nonexistent@test.com', password: rawPassword } };
    const resNoUser = createMockResponse();
    await login(reqNoUser, resNoUser, () => {});
    assert.equal(resNoUser.statusCode, 401);

    // 3. Invalid password returns 401
    const reqWrongPass = { body: { email: testEmailSupporter, password: 'WrongPassword' } };
    const resWrongPass = createMockResponse();
    await login(reqWrongPass, resWrongPass, () => {});
    assert.equal(resWrongPass.statusCode, 401);

    // 4. Role mismatch returns 403
    const reqWrongRole = {
      body: {
        email: testEmailSupporter,
        password: rawPassword,
        role: UserRoles.ORPHANAGE_ADMIN, // User is supporter
      },
    };
    const resWrongRole = createMockResponse();
    await login(reqWrongRole, resWrongRole, () => {});
    assert.equal(resWrongRole.statusCode, 403);
    assert.equal(resWrongRole.body.success, false);

    // 5. Successful login returns 200 with tokens
    const reqSuccess = {
      body: {
        email: testEmailSupporter,
        password: rawPassword,
        role: UserRoles.SUPPORTER,
      },
    };
    const resSuccess = createMockResponse();
    await login(reqSuccess, resSuccess, () => {});
    assert.equal(resSuccess.statusCode, 200);
    assert.equal(resSuccess.body.success, true);
    assert.ok(resSuccess.body.data.accessToken);
    assert.ok(resSuccess.body.data.refreshToken);
    assert.equal(resSuccess.body.data.user.email, testEmailSupporter.toLowerCase());
  });

  await t.test('Auth Middleware: Token Extraction & Verification', async () => {
    const supporterUser = await User.findOne({ email: testEmailSupporter.toLowerCase() });
    const validTokens = generateTokens({
      id: supporterUser._id.toString(),
      email: supporterUser.email,
      role: supporterUser.role,
    });

    // 1. Missing authorization header returns 401
    const reqNoAuth = { headers: {} };
    const resNoAuth = createMockResponse();
    let nextCalled = false;
    await authenticate(reqNoAuth, resNoAuth, () => { nextCalled = true; });
    assert.equal(resNoAuth.statusCode, 401);
    assert.equal(nextCalled, false);

    // 2. Malformed token returns 401
    const reqMalformed = { headers: { authorization: 'Bearer invalid.token.string' } };
    const resMalformed = createMockResponse();
    await authenticate(reqMalformed, resMalformed, () => {});
    assert.equal(resMalformed.statusCode, 401);

    // 3. Valid Bearer token attaches user to req.user and calls next()
    const reqValid = { headers: { authorization: `Bearer ${validTokens.accessToken}` } };
    const resValid = createMockResponse();
    let calledNextValid = false;
    await authenticate(reqValid, resValid, () => { calledNextValid = true; });
    assert.equal(calledNextValid, true);
    assert.ok(reqValid.user);
    assert.equal(reqValid.user.email, testEmailSupporter.toLowerCase());
    assert.equal(reqValid.user.role, UserRoles.SUPPORTER);
  });

  await t.test('Role Middleware: RBAC Enforcement', async () => {
    const supporterUser = await User.findOne({ email: testEmailSupporter.toLowerCase() });
    const orphanageUser = await User.findOne({ email: testEmailOrphanage.toLowerCase() });

    const adminOrOrphanageGuard = authorizeRoles('admin', 'orphanage');

    // 1. Unauthenticated request returns 401
    const reqNoUser = {};
    const resNoUser = createMockResponse();
    let called = false;
    adminOrOrphanageGuard(reqNoUser, resNoUser, () => { called = true; });
    assert.equal(resNoUser.statusCode, 401);
    assert.equal(called, false);

    // 2. Supporter attempting to access orphanage/admin route returns 403
    const reqSupporter = { user: supporterUser };
    const resSupporter = createMockResponse();
    let supporterCalled = false;
    adminOrOrphanageGuard(reqSupporter, resSupporter, () => { supporterCalled = true; });
    assert.equal(resSupporter.statusCode, 403);
    assert.equal(supporterCalled, false);

    // 3. Orphanage user accessing orphanage route succeeds
    const reqOrphanage = { user: orphanageUser };
    const resOrphanage = createMockResponse();
    let orphanageCalled = false;
    adminOrOrphanageGuard(reqOrphanage, resOrphanage, () => { orphanageCalled = true; });
    assert.equal(orphanageCalled, true);
  });

  await t.test('GetMe Controller Test', async () => {
    const supporterUser = await User.findOne({ email: testEmailSupporter.toLowerCase() });
    const req = { user: supporterUser };
    const res = createMockResponse();
    await getMe(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.user.email, testEmailSupporter.toLowerCase());
  });

  // Cleanup test documents from database
  await User.deleteMany({ email: { $in: [testEmailSupporter.toLowerCase(), testEmailOrphanage.toLowerCase()] } });

  await disconnectDB();
});
