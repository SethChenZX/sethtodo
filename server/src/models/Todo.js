import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'delayed', 'abandoned', 'overdue'], 
    default: 'pending' 
  },
  completedAt: Date,
  delayDays: Number,
  delayedAt: Date,
  deadline: { type: Date, required: true },
  reminderSent: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  estimatedTime: Number,
  actualTime: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

todoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.deadline) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    this.deadline = today;
  }
  next();
});

export default mongoose.model('Todo', todoSchema);
