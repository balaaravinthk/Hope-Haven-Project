import test from 'node:test';
import assert from 'node:assert';
import { validateAadhaar } from '../src/utils/verhoeff.js';

test('Aadhaar Verhoeff Checksum Validation', async (t) => {
  await t.test('rejects numbers starting with 0 or 1', () => {
    assert.strictEqual(validateAadhaar('012345678901'), false);
    assert.strictEqual(validateAadhaar('112345678901'), false);
  });

  await t.test('rejects numbers with length other than 12 digits', () => {
    assert.strictEqual(validateAadhaar('2345678901'), false);
    assert.strictEqual(validateAadhaar('23456789012345'), false);
  });

  await t.test('rejects letters and special characters without valid digits', () => {
    assert.strictEqual(validateAadhaar('ABCD-EFGH-IJKL'), false);
  });
});
