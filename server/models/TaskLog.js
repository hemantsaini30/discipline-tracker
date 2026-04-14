import mongoose from 'mongoose';

const taskLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  status: {
    type: String,
    enum: ['completed', 'late', 'missed', 'skipped'],
    required: true,
  },
  completedAt: { type: String }, // "HH:MM" actual completion time
  minutesLate: { type: Number, default: 0 },
  note: { type: String, trim: true },
}, { timestamps: true });

taskLogSchema.index({ user: 1, date: 1 });
taskLogSchema.index({ user: 1, task: 1, date: 1 }, { unique: true });

export default mongoose.model('TaskLog', taskLogSchema);
