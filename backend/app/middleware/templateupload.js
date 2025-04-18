import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadPath = path.join('uploads/templates');

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

// File filter to accept only Word files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (.doc, .docx) are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
