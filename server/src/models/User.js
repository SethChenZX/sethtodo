import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['normal', 'super'], default: 'normal' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
