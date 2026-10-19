/**
 * Orphanage Model / Schema Definition
 * Represents verified Child Care Institutions (CCIs), shelter homes, and trust orgs.
 */

export const OrphanageTypes = [
  "Children's Home / CCI",
  "Adoption Agency",
  "NGO / Trust",
  "Government Home",
];

export const VerificationStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const OrphanageSchema = {
  id: 'String (UUID / ObjectId / Auto-increment)',
  userId: 'Reference to User',          // Link to auth user
  name: { type: 'String', required: true },
  type: { type: 'String', enum: OrphanageTypes, required: true },
  address: { type: 'String', required: true },
  contact: { type: 'String', required: true },
  email: { type: 'String', required: true, unique: true },
  registrationNumber: { type: 'String', required: true }, // State institutional reg ID
  pan: { type: 'String', required: true },                // 10-character PAN number
  cciJj: { type: 'String', required: true },              // Juvenile Justice Act identifier
  authorizedPerson: { type: 'String', required: true },   // Representative full name
  aadhaarNumberMasked: { type: 'String', required: true },// Masked (XXXX XXXX 1234)
  aadhaarVerified: { type: 'Boolean', default: false },   // Validated via Verhoeff & OTP
  verificationStatus: { 
    type: 'String', 
    enum: Object.values(VerificationStatus), 
    default: VerificationStatus.PENDING 
  },
  photoPreview: { type: 'String', default: null },        // Path to exterior building photo
  documents: { type: 'Array', default: [] },              // Paths to uploaded registration proofs
  verifiedBadge: { type: 'Boolean', default: false },
  createdAt: 'Date',
  updatedAt: 'Date',
};
