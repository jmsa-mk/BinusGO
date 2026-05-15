import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nim: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Mahasiswa', 'Dosen', 'Staff', 'Admin'], default: 'Mahasiswa' },
  status: { type: String, enum: ['Aktif', 'Suspended'], default: 'Aktif' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
