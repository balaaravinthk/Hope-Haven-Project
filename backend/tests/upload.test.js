import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, UserRoles } from '../src/models/User.js';
import { Orphanage } from '../src/models/Orphanage.js';
import { register } from '../src/controllers/authController.js';

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

test('Multipart Orphanage Registration & File Upload Tests', async (t) => {
  await connectDB();

  const testEmail = `test.orphanage.upload.${Date.now()}@hopehaven.test`;
  const rawPassword = 'ValidPassword123!';

  // Create temporary mock upload files
  const testUploadDir = path.resolve('uploads');
  const photosDir = path.resolve('uploads/photos');
  const docsDir = path.resolve('uploads/documents');

  if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const tempPhotoName = `buildingPhoto-${Date.now()}-test.jpg`;
  const tempDocName = `registrationDoc-${Date.now()}-test.pdf`;

  fs.writeFileSync(path.join(photosDir, tempPhotoName), 'Fake JPG building photo content');
  fs.writeFileSync(path.join(docsDir, tempDocName), 'Fake PDF registration doc content');

  await t.test('Registers orphanage with multipart file paths saved in MongoDB Orphanage record', async () => {
    const req = {
      body: {
        role: 'orphanage',
        organizationName: 'Peace Children Home',
        organizationType: "Children's Home / CCI",
        address: '10 Peace Road, Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        contactNumber: '+91 98765 00000',
        orgEmail: testEmail,
        password: rawPassword,
        registrationNumber: `REG-TEST-${Date.now()}`,
        panNumber: 'ABCDE1234F',
        cciJjNumber: 'JJ-ACT-9999',
        authorizedPersonName: 'S. Rajendran',
        aadhaarNumber: '9999 9999 9999',
        aadhaarVerified: 'true',
      },
      files: {
        buildingPhoto: [
          {
            fieldname: 'buildingPhoto',
            filename: tempPhotoName,
            destination: photosDir,
            path: path.join(photosDir, tempPhotoName),
            size: 1024 * 500, // 500 KB
          },
        ],
        registrationDoc: [
          {
            fieldname: 'registrationDoc',
            filename: tempDocName,
            destination: docsDir,
            path: path.join(docsDir, tempDocName),
            size: 1024 * 1024 * 2, // 2 MB
          },
        ],
      },
    };

    const res = createMockResponse();

    await register(req, res, () => {});

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.user);
    assert.ok(res.body.data.orphanage);
    assert.ok(res.body.data.accessToken);

    // Verify User record in DB
    const dbUser = await User.findOne({ email: testEmail });
    assert.ok(dbUser);
    assert.equal(dbUser.role, UserRoles.ORPHANAGE_ADMIN);

    // Verify Orphanage record in DB
    const dbOrphanage = await Orphanage.findOne({ email: testEmail });
    assert.ok(dbOrphanage);
    assert.equal(dbOrphanage.name, 'Peace Children Home');
    assert.ok(dbOrphanage.photoPreview.includes(tempPhotoName), 'Should save buildingPhoto path in photoPreview');
    assert.ok(
      dbOrphanage.documents.some((doc) => doc.includes(tempDocName)),
      'Should save registrationDoc path in documents array'
    );
    assert.equal(dbOrphanage.aadhaarNumberMasked, 'XXXX XXXX 9999');
    assert.equal(dbOrphanage.aadhaarVerified, true);
  });

  // Cleanup test documents from database & disk
  await User.deleteOne({ email: testEmail });
  await Orphanage.deleteOne({ email: testEmail });

  try {
    fs.unlinkSync(path.join(photosDir, tempPhotoName));
    fs.unlinkSync(path.join(docsDir, tempDocName));
  } catch {
    // Ignore cleanup
  }

  await disconnectDB();
});
