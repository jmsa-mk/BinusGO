import mongoose from 'mongoose';

const tripHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  origin: String,
  destinationCampus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
  destinationName: String,
  mode: String,
}, { timestamps: true });

export default mongoose.model('TripHistory', tripHistorySchema);
