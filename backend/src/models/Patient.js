import mongoose from 'mongoose';

const PatientPhotoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  treatments: [{ type: String }],
  type: { type: String, enum: ['before', 'after'], required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tcId: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: null },
    birthDate: { type: Date },
    gender: { type: String, enum: ['female', 'male'], required: true },
    address: { type: String, trim: true },
    selectedTreatments: [{ type: String }],
    treatmentNotes: { type: String, trim: true },
    beforePhotos: [{ type: String }], // Legacy support
    afterPhotos: [{ type: String }], // Legacy support
    photos: [PatientPhotoSchema],
    allergies: { type: String, trim: true },
    medications: { type: String, trim: true },
    medicalHistory: { type: String, trim: true },
    notes: { type: String, trim: true },
    appointments: [{ 
      treatment: { type: String },
      date: { type: String },
      time: { type: String },
      duration: { type: Number },
      notes: { type: String }
    }],
    sameDayTreatments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Indexes for better performance
PatientSchema.index({ tcId: 1 });
PatientSchema.index({ name: 1 });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ createdBy: 1 });

export default mongoose.model('Patient', PatientSchema);
