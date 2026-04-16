import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['normal', 'super'], default: 'normal' },
  stripeCustomerId: { type: String, default: null },
  subscriptionId: { type: String, default: null },
  subscriptionStatus: { 
    type: String, 
    enum: ['none', 'active', 'canceled', 'past_due', 'incomplete'],
    default: 'none' 
  },
  subscriptionPlan: { type: String, default: null },
  subscriptionCurrentPeriodEnd: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
