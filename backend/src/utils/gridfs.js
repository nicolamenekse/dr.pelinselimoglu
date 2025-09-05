import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gfs;

// Initialize GridFS
export const initGridFS = () => {
  const conn = mongoose.connection;
  gfs = new GridFSBucket(conn.db, { bucketName: 'photos' });
};

// Upload file to GridFS
export const uploadToGridFS = (file, metadata = {}) => {
  return new Promise((resolve, reject) => {
    if (!gfs) {
      return reject(new Error('GridFS not initialized'));
    }

    const uploadStream = gfs.openUploadStream(file.originalname, {
      metadata: {
        ...metadata,
        uploadDate: new Date()
      }
    });

    const chunks = [];
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        id: uploadStream.id,
        filename: uploadStream.filename,
        metadata: uploadStream.options.metadata
      });
    });

    // Write file buffer to GridFS
    uploadStream.end(file.buffer);
  });
};

// Download file from GridFS
export const downloadFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gfs) {
      return reject(new Error('GridFS not initialized'));
    }

    const downloadStream = gfs.openDownloadStream(fileId);
    const chunks = [];

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', reject);
    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

// Delete file from GridFS
export const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gfs) {
      return reject(new Error('GridFS not initialized'));
    }

    gfs.delete(fileId, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Get file info from GridFS
export const getFileInfo = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!gfs) {
      return reject(new Error('GridFS not initialized'));
    }

    gfs.find({ _id: fileId }).toArray((err, files) => {
      if (err) return reject(err);
      if (files.length === 0) return reject(new Error('File not found'));
      resolve(files[0]);
    });
  });
};

export { gfs };
