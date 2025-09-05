import multer from 'multer';
import sharp from 'sharp';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Middleware to process and compress images
export const processImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const processedFiles = [];

    for (const file of req.files) {
      // Compress image using sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      processedFiles.push({
        ...file,
        buffer: processedBuffer,
        size: processedBuffer.length,
        mimetype: 'image/jpeg'
      });
    }

    req.files = processedFiles;
    next();
  } catch (error) {
    next(error);
  }
};

export { upload };
