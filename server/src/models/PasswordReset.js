import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

passwordResetSchema.index({ email: 1, createdAt: -1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

passwordResetSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

passwordResetSchema.methods.isValidOtp = function(otp) {
  if (this.used) return false;
  if (this.isExpired()) return false;
  if (this.attempts >= 5) return false;
  return this.otp === otp;
};

passwordResetSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

passwordResetSchema.methods.markAsUsed = function() {
  this.used = true;
  return this.save();
};

export default mongoose.model('PasswordReset', passwordResetSchema);