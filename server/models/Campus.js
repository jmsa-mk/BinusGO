import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cluster: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, enum: ['Aktif', 'Nonaktif'], default: 'Aktif' },
}, { timestamps: true });

export default mongoose.model('Campus', campusSchema);
