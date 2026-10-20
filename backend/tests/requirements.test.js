import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { getRequirements } from '../src/controllers/requirementController.js';
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

test('Requirement Controller: getRequirements with Priority Sorting and Populated Orphanage', async (t) => {
  await connectDB();

  await t.test('returns sorted requirements with populated orphanage details', async () => {
    const req = { query: {} };
    const res = createMockResponse();

    await getRequirements(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0, 'Should return seeded/stored requirements');

    const list = res.body.data;

    // Verify orphanage details are populated
    const first = list[0];
    assert.ok(first.orphanage);
    assert.ok(first.orphanage.name);
    assert.ok(first.orphanage.address);
    assert.ok(first.orphanage.contact);
    assert.equal(typeof first.orphanage.verified, 'boolean');

    // Verify sorting:
    // 1. Critical comes before Medium/Low
    // 2. High comes before Medium/Low
    const urgencyRanks = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    for (let i = 0; i < list.length - 1; i++) {
      const rankCurrent = urgencyRanks[list[i].urgency] || 0;
      const rankNext = urgencyRanks[list[i + 1].urgency] || 0;
      assert.ok(
        rankCurrent >= rankNext,
        `Expected ${list[i].urgency} (rank ${rankCurrent}) >= ${list[i + 1].urgency} (rank ${rankNext})`
      );

      // If equal urgency, lowest percentRaised comes first
      if (rankCurrent === rankNext) {
        const pctCurrent = (list[i].amountRaised || 0) / list[i].amountNeeded;
        const pctNext = (list[i + 1].amountRaised || 0) / list[i + 1].amountNeeded;
        assert.ok(
          pctCurrent <= pctNext + 0.0001,
          `Expected lower/equal percentRaised: ${pctCurrent} <= ${pctNext}`
        );
      }
    }
  });

  await t.test('filters by category correctly', async () => {
    const req = { query: { category: 'Healthcare' } };
    const res = createMockResponse();

    await getRequirements(req, res, () => {});

    assert.equal(res.statusCode, 200);
    const list = res.body.data;
    assert.ok(list.every((item) => item.category === 'Healthcare'));
  });

  await disconnectDB();
});
