import mongoose from 'mongoose';

const dayPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isLocked: { type: Boolean, default: false },
  note: { type: String },
}, { timestamps: true });

dayPlanSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DayPlan', dayPlanSchema);
