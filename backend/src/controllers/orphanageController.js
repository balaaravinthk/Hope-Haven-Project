import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const registerOrphanage = async (req, res, next) => {
  try {
    const {
      name,
      type,
      address,
      contact,
      email,
      registrationNumber,
      pan,
      cciJj,
      authorizedPerson,
      aadhaarNumber,
    } = req.body;

    const photo = req.files?.photo ? req.files.photo[0].path : null;
    const documents = req.files?.documents ? req.files.documents.map((f) => f.path) : [];

    const orphanageProfile = {
      id: 'orph_' + Date.now(),
      name,
      type,
      address,
      contact,
      email,
      registrationNumber,
      pan,
      cciJj,
      authorizedPerson,
      aadhaarNumberMasked: aadhaarNumber ? `XXXX XXXX ${aadhaarNumber.slice(-4)}` : null,
      verificationStatus: 'Pending',
      photoPreview: photo,
      documents,
      createdAt: new Date().toISOString(),
    };

    return sendSuccess(res, 'Orphanage submitted for verification successfully', orphanageProfile, 201);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // Return sample or DB record for logged-in orphanage
    const sampleProfile = {
      name: "Hope Children's Home",
      type: "Children's Home / CCI",
      address: "124 Peace Haven Road, Saravanampatti, Coimbatore, Tamil Nadu 641035",
      contact: "+91 98765 43210",
      email: "hopehaven.org@gmail.com",
      registrationNumber: "TN/CBE/2018/00492",
      pan: "AAATH1234F",
      cciJj: "JJ-ACT-2015-CCI-8842",
      authorizedPerson: "Dr. Revathi Sundaram",
      verificationStatus: "Approved",
    };
    return sendSuccess(res, 'Profile fetched successfully', sampleProfile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedData = req.body;
    return sendSuccess(res, 'Profile updated successfully', updatedData);
  } catch (error) {
    next(error);
  }
};
