import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const resizeAndSaveImage = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'No image buffer found' });
  }

  const filename = `signature-${Date.now()}.jpg`;
  const outputPath = path.join("uploads/signatures", filename);

  try {
    // Ensure the directory exists
    fs.mkdirSync("uploads/signatures", { recursive: true });

    await sharp(req.file.buffer)
      .resize(200)
      .jpeg({ quality: 100 })
      .toFile(outputPath);

    req.filePath = outputPath;
    next();
  } catch (err) {
    console.error('Error resizing image:', err);
    res.status(500).json({ message: 'Failed to process image' });
  }
};

export { resizeAndSaveImage };
