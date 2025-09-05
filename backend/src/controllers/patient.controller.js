import Patient from '../models/Patient.js';

// Get all patients for a user
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ createdBy: req.user.sub || req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hastalar getirilemedi',
      error: error.message
    });
  }
};

// Get single patient
export const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      createdBy: req.user.sub || req.user._id 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hasta getirilemedi',
      error: error.message
    });
  }
};

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      createdBy: req.user.sub || req.user._id,
      // Convert empty strings to null for optional fields
      email: req.body.email && req.body.email.trim() !== '' ? req.body.email.trim() : null,
      address: req.body.address && req.body.address.trim() !== '' ? req.body.address.trim() : null,
      treatmentNotes: req.body.treatmentNotes && req.body.treatmentNotes.trim() !== '' ? req.body.treatmentNotes.trim() : null,
      allergies: req.body.allergies && req.body.allergies.trim() !== '' ? req.body.allergies.trim() : null,
      medications: req.body.medications && req.body.medications.trim() !== '' ? req.body.medications.trim() : null,
      medicalHistory: req.body.medicalHistory && req.body.medicalHistory.trim() !== '' ? req.body.medicalHistory.trim() : null,
      notes: req.body.notes && req.body.notes.trim() !== '' ? req.body.notes.trim() : null,
      // Ensure arrays are properly handled
      selectedTreatments: Array.isArray(req.body.selectedTreatments) ? req.body.selectedTreatments : [],
      beforePhotos: Array.isArray(req.body.beforePhotos) ? req.body.beforePhotos : [],
      afterPhotos: Array.isArray(req.body.afterPhotos) ? req.body.afterPhotos : [],
      photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      appointments: Array.isArray(req.body.appointments) ? req.body.appointments : [],
      sameDayTreatments: Array.isArray(req.body.sameDayTreatments) ? req.body.sameDayTreatments : []
    };

    // Check if TC ID already exists
    const existingPatient = await Patient.findOne({ 
      tcId: patientData.tcId,
      createdBy: req.user.sub || req.user._id 
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Bu TC kimlik numarası ile kayıtlı hasta zaten mevcut'
      });
    }

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Hasta başarıyla oluşturuldu',
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    console.error('Request body:', req.body);
    console.error('Processed patientData:', patientData);
    console.error('User:', req.user);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu TC kimlik numarası zaten kullanılıyor'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Hasta oluşturulamadı',
      error: error.message,
      details: error.stack
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.sub || req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Hasta başarıyla güncellendi',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hasta güncellenemedi',
      error: error.message
    });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.sub || req.user._id 
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Hasta başarıyla silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hasta silinemedi',
      error: error.message
    });
  }
};

// Search patients
export const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gerekli'
      });
    }

    const patients = await Patient.find({
      createdBy: req.user.sub || req.user._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tcId: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Arama yapılamadı',
      error: error.message
    });
  }
};
