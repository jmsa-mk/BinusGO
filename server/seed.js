import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Campus from './models/Campus.js';
import Route from './models/Route.js';

const CAMPUSES = [
  // Kemanggisan
  { name: 'BINUS Kemanggisan – Kampus Anggrek', cluster: 'KEMANGGISAN', address: 'Jl. Kebon Jeruk Raya No.27, Jakarta Barat', lat: -6.2024, lng: 106.7822 },
  { name: 'BINUS Kemanggisan – Kampus Kijang',  cluster: 'KEMANGGISAN', address: 'Jl. Kemanggisan Ilir III No.45, Jakarta Barat', lat: -6.2009, lng: 106.7861 },
  { name: 'BINUS Kemanggisan – Kampus Syahdan', cluster: 'KEMANGGISAN', address: 'Jl. K.H. Syahdan No.9, Jakarta Barat', lat: -6.2005, lng: 106.7903 },
  { name: 'BINUS Kemanggisan – Kampus JWC',     cluster: 'KEMANGGISAN', address: 'Jl. Hang Lekir I No.6, Senayan, Jakarta Pusat', lat: -6.2249, lng: 106.8038 },
  // Alam Sutera
  { name: 'BINUS Alam Sutera – Kampus Utama',   cluster: 'ALAM SUTERA', address: 'Jl. Jalur Sutera Barat No.6, Alam Sutera, Tangerang', lat: -6.2238, lng: 106.6543 },
  { name: 'BINUS Alam Sutera – Annex',          cluster: 'ALAM SUTERA', address: 'Jl. Jalur Sutera Timur, Alam Sutera, Tangerang', lat: -6.2244, lng: 106.6562 },
  // BSD
  { name: 'BINUS BSD – Kampus Utama',           cluster: 'BSD', address: 'Jl. Letnan Sutopo, BSD City, Tangerang Selatan', lat: -6.3017, lng: 106.6531 },
  { name: 'BINUS BSD – School of Computer Science', cluster: 'BSD', address: 'BSD City, Tangerang Selatan', lat: -6.3025, lng: 106.6548 },
  // Bekasi
  { name: 'BINUS Bekasi – Kampus Utama',        cluster: 'BEKASI', address: 'Jl. Bulevar Ahmad Yani Kav. M1-3, Summarecon Bekasi', lat: -6.2349, lng: 106.9988 },
  // Bandung
  { name: 'BINUS Bandung – Kampus Utama',       cluster: 'BANDUNG', address: 'Jl. Pasir Kaliki No.25-27, Bandung', lat: -6.9098, lng: 107.5944 },
  // Malang
  { name: 'BINUS Malang – Kampus Utama',        cluster: 'MALANG', address: 'Jl. Araya Mansion No.8-10, Malang', lat: -7.9610, lng: 112.6711 },
  // Semarang
  { name: 'BINUS Semarang – Kampus Utama',      cluster: 'SEMARANG', address: 'Jl. Pemuda No.142, Semarang', lat: -6.9847, lng: 110.4097 },
  // Medan
  { name: 'BINUS Medan – Kampus Utama',         cluster: 'MEDAN', address: 'Jl. Boulevard Barat Raya, Medan', lat: 3.5952, lng: 98.6722 },
  // Online
  { name: 'BINUS Online Learning',              cluster: 'ONLINE', address: 'Jl. Kebon Jeruk Raya No.27, Jakarta Barat', lat: -6.2024, lng: 106.7822 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/binusgo');
  console.log('Connected. Seeding…');

  await Promise.all([User.deleteMany({}), Campus.deleteMany({}), Route.deleteMany({})]);

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('student123', 10);
  await User.create([
    { name: 'Admin BinusGO', email: 'admin@binus.edu', password: adminHash, role: 'Admin' },
    { name: 'Mahasiswa Demo', nim: '2802408190', email: 'student@binus.ac.id', password: userHash, role: 'Mahasiswa' },
  ]);

  const campuses = await Campus.insertMany(CAMPUSES);
  const anggrek = campuses.find((c) => c.name.includes('Anggrek'));
  const alamSutera = campuses.find((c) => c.name.includes('Alam Sutera – Kampus Utama'));
  const bsd = campuses.find((c) => c.name.includes('BSD – Kampus Utama'));

  const routes = [
    {
      origin: 'Stasiun Velodrome',
      destinationCampus: anggrek._id,
      modes: ['LRT', 'TransJakarta'],
      durationMin: 74,
      price: 8500,
      steps: [
        { type: 'walk', durationMin: 4, stopName: 'St. Velodrome' },
        { type: 'LRT', durationMin: 28, stopName: 'St. Velodrome → St. Dukuh Atas', line: 'LRT Jabodebek' },
        { type: 'walk', durationMin: 3, stopName: 'Dukuh Atas Transit' },
        { type: 'TransJakarta', durationMin: 32, stopName: 'Dukuh Atas → Kebon Jeruk', line: 'Koridor 2' },
        { type: 'walk', durationMin: 5, stopName: 'Kampus Anggrek' },
      ],
      waypoints: [
        { lat: -6.1944, lng: 106.9003, stopName: 'St. Velodrome', transitMode: 'walk' },
        { lat: -6.2007, lng: 106.8227, stopName: 'St. Dukuh Atas', transitMode: 'LRT' },
        { lat: -6.2024, lng: 106.7822, stopName: 'Kampus Anggrek', transitMode: 'TransJakarta' },
      ],
      jadwal: ['06:30', '07:15', '08:00', '08:45', '12:00', '14:02', '16:30', '18:00'],
    },
    {
      origin: 'Stasiun Tanah Abang',
      destinationCampus: anggrek._id,
      modes: ['KRL', 'TransJakarta'],
      durationMin: 55,
      price: 6500,
      steps: [
        { type: 'walk', durationMin: 3, stopName: 'St. Tanah Abang' },
        { type: 'KRL', durationMin: 18, stopName: 'Tanah Abang → Palmerah', line: 'Commuter Line Rangkasbitung' },
        { type: 'walk', durationMin: 4, stopName: 'Halte Palmerah' },
        { type: 'TransJakarta', durationMin: 25, stopName: 'Palmerah → Kebon Jeruk', line: 'Koridor 8' },
        { type: 'walk', durationMin: 5, stopName: 'Kampus Anggrek' },
      ],
      waypoints: [
        { lat: -6.1862, lng: 106.8106, stopName: 'St. Tanah Abang', transitMode: 'walk' },
        { lat: -6.2076, lng: 106.7977, stopName: 'St. Palmerah', transitMode: 'KRL' },
        { lat: -6.2024, lng: 106.7822, stopName: 'Kampus Anggrek', transitMode: 'TransJakarta' },
      ],
      jadwal: ['06:00', '07:00', '08:00', '12:00', '15:00', '17:00'],
    },
    {
      origin: 'Stasiun Sudimara',
      destinationCampus: alamSutera._id,
      modes: ['KRL', 'Mikrotrans'],
      durationMin: 48,
      price: 5000,
      steps: [
        { type: 'walk', durationMin: 3, stopName: 'St. Sudimara' },
        { type: 'KRL', durationMin: 15, stopName: 'Sudimara → Serpong', line: 'Commuter Line' },
        { type: 'walk', durationMin: 3, stopName: 'Halte Serpong' },
        { type: 'Mikrotrans', durationMin: 22, stopName: 'Serpong → Alam Sutera', line: 'JAK-M01' },
        { type: 'walk', durationMin: 5, stopName: 'BINUS Alam Sutera' },
      ],
      waypoints: [
        { lat: -6.2696, lng: 106.7165, stopName: 'St. Sudimara', transitMode: 'walk' },
        { lat: -6.3175, lng: 106.6716, stopName: 'St. Serpong', transitMode: 'KRL' },
        { lat: -6.2238, lng: 106.6543, stopName: 'BINUS Alam Sutera', transitMode: 'Mikrotrans' },
      ],
      jadwal: ['06:30', '07:30', '08:30', '13:00', '17:00'],
    },
    {
      origin: 'Stasiun BSD City',
      destinationCampus: bsd._id,
      modes: ['Mikrotrans'],
      durationMin: 25,
      price: 3500,
      steps: [
        { type: 'walk', durationMin: 4, stopName: 'St. Cisauk / BSD' },
        { type: 'Mikrotrans', durationMin: 16, stopName: 'BSD Loop', line: 'JAK-BSD01' },
        { type: 'walk', durationMin: 5, stopName: 'BINUS BSD' },
      ],
      waypoints: [
        { lat: -6.3127, lng: 106.6404, stopName: 'St. Cisauk', transitMode: 'walk' },
        { lat: -6.3017, lng: 106.6531, stopName: 'BINUS BSD', transitMode: 'Mikrotrans' },
      ],
      jadwal: ['06:00', '07:00', '08:00', '13:00', '17:00'],
    },
  ];

  await Route.insertMany(routes);

  console.log('✓ Seeded', campuses.length, 'campuses,', routes.length, 'routes, 2 users.');
  console.log('  Admin: admin@binus.edu / admin123');
  console.log('  User:  student@binus.ac.id / student123');
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
