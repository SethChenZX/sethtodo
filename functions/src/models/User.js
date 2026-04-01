import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['normal', 'super', null], 
    default: null 
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ firebaseUid: 1 });

export default mongoose.model('User', userSchema);
