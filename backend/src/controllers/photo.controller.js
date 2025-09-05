import Photo from '../models/Photo.js';
import Patient from '../models/Patient.js';
import { uploadToGridFS, downloadFromGridFS, deleteFromGridFS } from '../utils/gridfs.js';

// Upload photos
export const uploadPhotos = async (req, res) => {
  try {
    const { patientId, treatments, type } = req.body;
    
    if (!patientId || !treatments || !type) {
      return res.status(400).json({
        success: false,
        message: 'Hasta ID, tedavi bilgileri ve fotoğraf türü gerekli'
      });
    }

    // Check if patient exists and belongs to user
    const patient = await Patient.findOne({ 
      _id: patientId, 
      createdBy: req.user.sub || req.user._id 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Fotoğraf dosyası gerekli'
      });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      // Upload to GridFS
      const gridfsResult = await uploadToGridFS(file, {
        patientId,
        treatments: treatments.split(',').map(t => t.trim()),
        type,
        uploadedBy: req.user.sub || req.user._id
      });

      // Save photo metadata to database
      const photo = new Photo({
        filename: gridfsResult.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        gridfsId: gridfsResult.id,
        patientId,
        treatments: treatments.split(',').map(t => t.trim()),
        type,
        uploadedBy: req.user.sub || req.user._id
      });

      await photo.save();

      // Add photo to patient's photos array
      patient.photos.push({
        url: `/api/photos/${photo._id}`,
        treatments: photo.treatments,
        type: photo.type,
        uploadedAt: photo.createdAt.toISOString()
      });

      uploadedPhotos.push(photo);
    }

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Fotoğraflar başarıyla yüklendi',
      data: uploadedPhotos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fotoğraf yüklenemedi',
      error: error.message
    });
  }
};

// Get photo
export const getPhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({ 
      _id: req.params.id,
      uploadedBy: req.user.sub || req.user._id 
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Fotoğraf bulunamadı'
      });
    }

    // Get file from GridFS
    const fileBuffer = await downloadFromGridFS(photo.gridfsId);

    res.set({
      'Content-Type': photo.mimetype,
      'Content-Length': fileBuffer.length,
      'Cache-Control': 'public, max-age=31536000' // 1 year cache
    });

    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fotoğraf getirilemedi',
      error: error.message
    });
  }
};

// Delete photo
export const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findOne({ 
      _id: req.params.id,
      uploadedBy: req.user.sub || req.user._id 
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Fotoğraf bulunamadı'
      });
    }

    // Delete from GridFS
    await deleteFromGridFS(photo.gridfsId);

    // Remove from patient's photos array
    await Patient.updateOne(
      { _id: photo.patientId },
      { $pull: { photos: { url: `/api/photos/${photo._id}` } } }
    );

    // Delete photo metadata
    await Photo.findByIdAndDelete(photo._id);

    res.json({
      success: true,
      message: 'Fotoğraf başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fotoğraf silinemedi',
      error: error.message
    });
  }
};

// Get patient photos
export const getPatientPhotos = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if patient exists and belongs to user
    const patient = await Patient.findOne({ 
      _id: patientId, 
      createdBy: req.user.sub || req.user._id 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    const photos = await Photo.find({ 
      patientId,
      uploadedBy: req.user.sub || req.user._id 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: photos,
      count: photos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fotoğraflar getirilemedi',
      error: error.message
    });
  }
};
