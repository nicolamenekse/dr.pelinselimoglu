import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    gridfsId: { type: mongoose.Schema.Types.ObjectId, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    treatments: [{ type: String }],
    type: { type: String, enum: ['before', 'after'], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Indexes for better performance
PhotoSchema.index({ patientId: 1 });
PhotoSchema.index({ gridfsId: 1 });
PhotoSchema.index({ uploadedBy: 1 });

export default mongoose.model('Photo', PhotoSchema);
