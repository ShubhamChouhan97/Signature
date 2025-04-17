import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadPath = path.join('uploads/exceldata');

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

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xls','.xlsx','.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel documents are allowed!'), false);
  }
};
const uploadexcel = multer({ storage ,fileFilter});

export default uploadexcel;
