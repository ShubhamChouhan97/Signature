import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadPath = path.join("uploads/signatures");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "signature-" + uniqueSuffix + ext);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpg|jpeg|png|bmp/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, bmp)"));
  }
};

const UploadSign = multer({ storage: multer.memoryStorage(), fileFilter });

// 👇 Fix: use named export
export { UploadSign };
