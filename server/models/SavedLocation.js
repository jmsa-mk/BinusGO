import mongoose from 'mongoose';

const savedLocationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
}, { timestamps: true });

savedLocationSchema.index({ user: 1, campus: 1 }, { unique: true });

export default mongoose.model('SavedLocation', savedLocationSchema);
