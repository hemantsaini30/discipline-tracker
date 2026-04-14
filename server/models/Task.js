import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Morning Routine', 'Sleep', 'Study', 'Fitness', 'Sports', 'Work', 'Personal Care', 'Productivity'],
    default: 'Productivity',
  },
  recurrence: {
    type: String,
    enum: ['daily', 'weekdays', 'weekends', 'custom'],
    default: 'daily',
  },
  customDays: [{ type: Number }], // 0=Sun, 1=Mon ... 6=Sat
  targetTime: { type: String }, // "05:00"
  toleranceMinutes: { type: Number, default: 15 }, // how late is "acceptable"
  weight: { type: Number, default: 1, min: 0.5, max: 5 }, // importance weight
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
