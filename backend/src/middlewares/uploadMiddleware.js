import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendError } from '../utils/apiResponse.js';

// Resolve upload directories
const uploadsDir = path.resolve('uploads');
const photosDir = path.resolve('uploads/photos');
const docsDir = path.resolve('uploads/documents');

// Ensure upload directories exist
[uploadsDir, photosDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Multer disk storage configuration:
 * Saves files into backend/uploads/ with timestamped filenames
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If photos or documents subfolders preferred, route accordingly; default to uploadsDir
    if (file.fieldname === 'buildingPhoto' || file.fieldname === 'photo' || file.fieldname === 'frontPicture') {
      cb(null, photosDir);
    } else if (
      file.fieldname === 'registrationDoc' ||
      file.fieldname === 'documents' ||
      file.fieldname === 'registrationCertificate' ||
      file.fieldname === 'idProof' ||
      file.fieldname === 'addressProof'
    ) {
      cb(null, docsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedField = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    cb(null, `${sanitizedField}-${timestamp}-${randomSuffix}${ext}`);
  },
});

/**
 * File filter:
 * - buildingPhoto: jpg/jpeg/png (max 2MB)
 * - registrationDoc: pdf/jpg/jpeg/png (max 5MB)
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype.toLowerCase();

  // Photo uploads (buildingPhoto / frontPicture / photo)
  if (['buildingPhoto', 'frontPicture', 'photo'].includes(file.fieldname)) {
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) && mime.startsWith('image/');
    if (!isImage) {
      return cb(new Error('buildingPhoto must be a JPG or PNG image (max 2MB).'), false);
    }
    return cb(null, true);
  }

  // Document uploads (registrationDoc / documents / certificates)
  if (
    ['registrationDoc', 'documents', 'registrationCertificate', 'idProof', 'addressProof'].includes(
      file.fieldname
    )
  ) {
    const isDoc = ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext);
    if (!isDoc) {
      return cb(new Error('registrationDoc must be a PDF or JPG/PNG file (max 5MB).'), false);
    }
    return cb(null, true);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB ceiling
  },
  fileFilter,
});

/**
 * Multipart fields handler for registration
 */
const registrationFields = upload.fields([
  { name: 'buildingPhoto', maxCount: 1 },
  { name: 'frontPicture', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'registrationDoc', maxCount: 5 },
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);

/**
 * Middleware handling multipart registration file uploads with field-specific size checks
 */
export const handleRegistrationUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  // Only run Multer if request is multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    registrationFields(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 'Uploaded file exceeds the maximum 5MB size limit.', null, 400);
        }
        return sendError(res, err.message, null, 400);
      }

      // Enforce 2MB size limit specifically for buildingPhoto
      const photoFiles =
        req.files?.buildingPhoto || req.files?.frontPicture || req.files?.photo;
      if (photoFiles && photoFiles[0]) {
        if (photoFiles[0].size > 2 * 1024 * 1024) {
          // Remove oversized file
          try {
            if (fs.existsSync(photoFiles[0].path)) fs.unlinkSync(photoFiles[0].path);
          } catch {
            // Ignore unlink errors
          }
          return sendError(res, 'buildingPhoto must not exceed 2MB.', null, 400);
        }
      }

      next();
    });
  } else {
    next();
  }
};

export default upload;
