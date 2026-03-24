import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

verificationSchema.index({ email: 1, createdAt: -1 });

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

verificationSchema.methods.isValidOtp = function(otp) {
  if (this.verified) return false;
  if (this.isExpired()) return false;
  if (this.attempts >= 5) return false;
  return this.otp === otp;
};

verificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

export default mongoose.model('Verification', verificationSchema);
