import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  appName: { type: String, default: 'BinusGO!' },
  tagline: { type: String, default: 'Transit Cerdas Menuju Kampus' },
  serviceStatus: { type: String, enum: ['Aktif', 'Maintenance'], default: 'Aktif' },
  allowedDomains: { type: [String], default: ['binus.ac.id', 'binus.edu'] },
  enableOAuth: { type: Boolean, default: false },
  maxRoutesPerSearch: { type: Number, default: 20 },
  contactEmail: { type: String, default: 'support@binus.edu' },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
