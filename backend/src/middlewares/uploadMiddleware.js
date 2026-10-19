import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const photosDir = path.resolve('uploads/photos');
const docsDir = path.resolve('uploads/documents');

if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      cb(null, photosDir);
    } else {
      cb(null, docsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png|webp/;
  const allowedDoc = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (file.fieldname === 'photo' && allowedImage.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'documents' && allowedDoc.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: .${ext}`));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});
