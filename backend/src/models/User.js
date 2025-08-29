import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VerificationTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    verification: VerificationTokenSchema,
    resetPassword: VerificationTokenSchema,
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export default mongoose.model('User', UserSchema);


