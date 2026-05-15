import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  type: { type: String, enum: ['walk', 'TransJakarta', 'KRL', 'LRT', 'Mikrotrans'], required: true },
  durationMin: Number,
  stopName: String,
  line: String,
  detail: String,
}, { _id: false });

const waypointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  stopName: String,
  transitMode: String,
}, { _id: false });

const routeSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destinationCampus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  modes: [{ type: String, enum: ['TransJakarta', 'KRL', 'LRT', 'Mikrotrans'] }],
  durationMin: { type: Number, required: true },
  price: { type: Number, default: 0 },
  steps: [stepSchema],
  waypoints: [waypointSchema],
  jadwal: [String],
  status: { type: String, enum: ['Aktif', 'Nonaktif'], default: 'Aktif' },
  searchCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
