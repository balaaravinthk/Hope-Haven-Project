import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import {
  applyVolunteer,
  getOrphanageApplications,
  updateApplicationStatus,
} from '../src/controllers/volunteerController.js';
import { VolunteerApplication, ApplicationStatus } from '../src/models/VolunteerApplication.js';
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

test('Volunteer System Backend Integration Tests', async (t) => {
  await connectDB();

  let orphanage = await Orphanage.findOne();
  if (!orphanage) {
    orphanage = await Orphanage.create({
      name: "Hope Children's Home",
      type: "Children's Home / CCI",
      address: '12, Green Park Road, Coimbatore',
      contact: '+91 98765 43210',
      email: `orphanage.vol.${Date.now()}@hopehaven.test`,
      registrationNumber: `REG-VOL-${Date.now()}`,
      pan: 'AAATH5678F',
      cciJj: 'JJ-ACT-9999',
      authorizedPerson: 'Dr. Revathi Sundaram',
      aadhaarNumberMasked: 'XXXX XXXX 1234',
      aadhaarVerified: true,
      verificationStatus: 'Approved',
    });
  }

  let createdAppId = null;

  await t.test('POST /api/volunteers/apply creates application with skills and schedule', async () => {
    const req = {
      headers: {},
      body: {
        orphanageId: orphanage._id,
        roleTitle: 'Weekend Math Tutor',
        name: 'Rohan Sharma',
        email: 'rohan.sharma@gmail.com',
        phone: '+91 98111 22233',
        skills: 'High school mathematics and coding basics',
        schedule: 'Every Saturday 2 PM to 5 PM',
      },
    };
    const res = createMockResponse();

    await applyVolunteer(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Rohan Sharma');
    assert.equal(res.body.data.skills, 'High school mathematics and coding basics');
    assert.equal(res.body.data.schedule, 'Every Saturday 2 PM to 5 PM');
    assert.equal(res.body.data.status, ApplicationStatus.PENDING);

    createdAppId = res.body.data._id.toString();
  });

  await t.test('POST /api/volunteers/apply rejects submission missing skills or schedule', async () => {
    const reqNoSkills = {
      headers: {},
      body: {
        name: 'No Skills Volunteer',
        email: 'noskills@gmail.com',
        schedule: 'Weekends',
      },
    };
    const resNoSkills = createMockResponse();
    await applyVolunteer(reqNoSkills, resNoSkills, () => {});
    assert.equal(resNoSkills.statusCode, 400);

    const reqNoSchedule = {
      headers: {},
      body: {
        name: 'No Schedule Volunteer',
        email: 'noschedule@gmail.com',
        skills: 'Art and crafts',
      },
    };
    const resNoSchedule = createMockResponse();
    await applyVolunteer(reqNoSchedule, resNoSchedule, () => {});
    assert.equal(resNoSchedule.statusCode, 400);
  });

  await t.test('GET /api/volunteers/orphanage returns list of volunteer applications', async () => {
    const req = {
      headers: {},
      query: { orphanageId: orphanage._id.toString() },
    };
    const res = createMockResponse();

    await getOrphanageApplications(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);

    const found = res.body.data.find((a) => a.name === 'Rohan Sharma');
    assert.ok(found);
    assert.equal(found.skills, 'High school mathematics and coding basics');
  });

  await t.test("PATCH /api/volunteers/applications/:id/status updates to 'approved' and 'declined'", async () => {
    assert.ok(createdAppId);

    // Test Approve
    const reqApprove = {
      params: { id: createdAppId },
      body: { status: 'approved' },
    };
    const resApprove = createMockResponse();
    await updateApplicationStatus(reqApprove, resApprove, () => {});

    assert.equal(resApprove.statusCode, 200);
    assert.equal(resApprove.body.data.status, 'approved');

    // Test Decline
    const reqDecline = {
      params: { id: createdAppId },
      body: { status: 'declined' },
    };
    const resDecline = createMockResponse();
    await updateApplicationStatus(reqDecline, resDecline, () => {});

    assert.equal(resDecline.statusCode, 200);
    assert.equal(resDecline.body.data.status, 'declined');
  });

  t.after(async () => {
    if (createdAppId) {
      await VolunteerApplication.findByIdAndDelete(createdAppId);
    }
    await disconnectDB();
  });
});
