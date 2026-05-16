import mongoose from 'mongoose';

const savedRouteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
}, { timestamps: true });

savedRouteSchema.index({ user: 1, route: 1 }, { unique: true });

export default mongoose.model('SavedRoute', savedRouteSchema);
