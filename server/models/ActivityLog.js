import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userRole: String,
  action: { type: String, required: true, index: true },
  detail: String,
  ip: String,
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
