import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Campus from './models/Campus.js';
import Route from './models/Route.js';

const CAMPUSES = [
  { name: 'BINUS Kemanggisan - Kampus Anggrek', cluster: 'KEMANGGISAN', address: 'Jl. Kebon Jeruk Raya No.27, Jakarta Barat', lat: -6.2024, lng: 106.7822 },
  { name: 'BINUS Kemanggisan - Kampus Kijang',  cluster: 'KEMANGGISAN', address: 'Jl. Kemanggisan Ilir III No.45, Jakarta Barat', lat: -6.2009, lng: 106.7861 },
  { name: 'BINUS Kemanggisan - Kampus Syahdan', cluster: 'KEMANGGISAN', address: 'Jl. K.H. Syahdan No.9, Jakarta Barat', lat: -6.2005, lng: 106.7903 },
  { name: 'BINUS Kemanggisan - Kampus JWC',     cluster: 'KEMANGGISAN', address: 'Jl. Hang Lekir I No.6, Senayan, Jakarta Pusat', lat: -6.2249, lng: 106.8038 },
  { name: 'BINUS Alam Sutera - Kampus Utama',   cluster: 'ALAM SUTERA', address: 'Jl. Jalur Sutera Barat No.6, Alam Sutera, Tangerang', lat: -6.2238, lng: 106.6543 },
  { name: 'BINUS Alam Sutera - Annex',          cluster: 'ALAM SUTERA', address: 'Jl. Jalur Sutera Timur, Alam Sutera, Tangerang', lat: -6.2244, lng: 106.6562 },
  { name: 'BINUS BSD - Kampus Utama',           cluster: 'BSD', address: 'Jl. Letnan Sutopo, BSD City, Tangerang Selatan', lat: -6.3017, lng: 106.6531 },
  { name: 'BINUS BSD - School of Computer Science', cluster: 'BSD', address: 'BSD City, Tangerang Selatan', lat: -6.3025, lng: 106.6548 },
  { name: 'BINUS Bekasi - Kampus Utama',        cluster: 'BEKASI', address: 'Jl. Bulevar Ahmad Yani Kav. M1-3, Summarecon Bekasi', lat: -6.2349, lng: 106.9988 },
  { name: 'BINUS Bandung - Kampus Utama',       cluster: 'BANDUNG', address: 'Jl. Pasir Kaliki No.25-27, Bandung', lat: -6.9098, lng: 107.5944 },
  { name: 'BINUS Malang - Kampus Utama',        cluster: 'MALANG', address: 'Jl. Araya Mansion No.8-10, Malang', lat: -7.9610, lng: 112.6711 },
  { name: 'BINUS Semarang - Kampus Utama',      cluster: 'SEMARANG', address: 'Jl. Pemuda No.142, Semarang', lat: -6.9847, lng: 110.4097 },
  { name: 'BINUS Medan - Kampus Utama',         cluster: 'MEDAN', address: 'Jl. Boulevard Barat Raya, Medan', lat: 3.5952, lng: 98.6722 },
  { name: 'BINUS Online Learning',              cluster: 'ONLINE', address: 'Jl. Kebon Jeruk Raya No.27, Jakarta Barat', lat: -6.2024, lng: 106.7822 },
];

// Transit stops library
const S = {
  // KRL
  TANAH_ABANG:   { name: 'Stasiun Tanah Abang',   lat: -6.1862, lng: 106.8106 },
  SUDIRMAN:      { name: 'Stasiun Sudirman',      lat: -6.2014, lng: 106.8231 },
  MANGGARAI:     { name: 'Stasiun Manggarai',     lat: -6.2105, lng: 106.8503 },
  JATINEGARA:    { name: 'Stasiun Jatinegara',    lat: -6.2155, lng: 106.8704 },
  JAKARTA_KOTA:  { name: 'Stasiun Jakarta Kota',  lat: -6.1377, lng: 106.8146 },
  PASAR_SENEN:   { name: 'Stasiun Pasar Senen',   lat: -6.1740, lng: 106.8434 },
  GAMBIR:        { name: 'Stasiun Gambir',        lat: -6.1768, lng: 106.8307 },
  DEPOK:         { name: 'Stasiun Depok Baru',    lat: -6.4017, lng: 106.8232 },
  BOGOR:         { name: 'Stasiun Bogor',         lat: -6.5546, lng: 106.7898 },
  BEKASI:        { name: 'Stasiun Bekasi',        lat: -6.2390, lng: 107.0017 },
  CAKUNG:        { name: 'Stasiun Cakung',        lat: -6.1929, lng: 106.9484 },
  TANGERANG_ST:  { name: 'Stasiun Tangerang',     lat: -6.1786, lng: 106.6308 },
  SERPONG:       { name: 'Stasiun Serpong',       lat: -6.3175, lng: 106.6716 },
  CISAUK:        { name: 'Stasiun Cisauk',        lat: -6.3127, lng: 106.6404 },
  SUDIMARA:      { name: 'Stasiun Sudimara',      lat: -6.2696, lng: 106.7165 },
  PALMERAH:      { name: 'Stasiun Palmerah',      lat: -6.2076, lng: 106.7977 },
  PONDOK_RANJI:  { name: 'Stasiun Pondok Ranji',  lat: -6.2768, lng: 106.7383 },
  KEBAYORAN:     { name: 'Stasiun Kebayoran',     lat: -6.2419, lng: 106.7833 },
  LENTENG:       { name: 'Stasiun Lenteng Agung', lat: -6.3389, lng: 106.8362 },
  UI_KRL:        { name: 'Stasiun Universitas Indonesia', lat: -6.3614, lng: 106.8312 },
  CITAYAM:       { name: 'Stasiun Citayam',       lat: -6.4423, lng: 106.8328 },

  // LRT Jabodebek
  DUKUH_ATAS:    { name: 'Stasiun Dukuh Atas LRT', lat: -6.2007, lng: 106.8227 },
  SETIABUDI:     { name: 'Stasiun Setiabudi',      lat: -6.2099, lng: 106.8275 },
  KUNINGAN:      { name: 'Stasiun Kuningan',       lat: -6.2249, lng: 106.8285 },
  PANCORAN:      { name: 'Stasiun Pancoran',       lat: -6.2418, lng: 106.8418 },
  CIKOKO:        { name: 'Stasiun Cikoko',         lat: -6.2466, lng: 106.8538 },
  CAWANG:        { name: 'Stasiun Cawang LRT',     lat: -6.2531, lng: 106.8716 },
  HALIM:         { name: 'Stasiun Halim',          lat: -6.2627, lng: 106.8895 },
  TMII:          { name: 'Stasiun TMII LRT',       lat: -6.2956, lng: 106.8852 },
  KP_RAMBUTAN:   { name: 'Stasiun Kampung Rambutan LRT', lat: -6.3122, lng: 106.8836 },
  HARJAMUKTI:    { name: 'Stasiun Harjamukti',     lat: -6.4126, lng: 106.8989 },
  VELODROME:     { name: 'Stasiun Velodrome',      lat: -6.1944, lng: 106.9003 },
  BEKASI_BARAT:  { name: 'Stasiun Bekasi Barat LRT', lat: -6.2440, lng: 106.9952 },
  JATIBENING:    { name: 'Stasiun Jatibening Baru',  lat: -6.2630, lng: 106.9601 },

  // TransJakarta haltes
  BLOK_M:        { name: 'Halte Blok M',           lat: -6.2436, lng: 106.7986 },
  KOTA_TJ:       { name: 'Halte Kota TJ',          lat: -6.1377, lng: 106.8146 },
  PLUIT:         { name: 'Halte Pluit',            lat: -6.1287, lng: 106.7895 },
  PULOGADUNG:    { name: 'Halte Pulogadung',       lat: -6.1880, lng: 106.9075 },
  KALIDERES:     { name: 'Halte Kalideres',        lat: -6.1597, lng: 106.7039 },
  RAGUNAN:       { name: 'Halte Ragunan',          lat: -6.3105, lng: 106.8222 },
  LEBAK_BULUS:   { name: 'Halte Lebak Bulus',      lat: -6.2895, lng: 106.7762 },
  SENAYAN:       { name: 'Halte Senayan',          lat: -6.2207, lng: 106.8025 },
  HARMONI:       { name: 'Halte Harmoni',          lat: -6.1665, lng: 106.8203 },
  GROGOL:        { name: 'Halte Grogol',           lat: -6.1654, lng: 106.7900 },
  CIBUBUR:       { name: 'Halte Cibubur Junction', lat: -6.3650, lng: 106.8842 },
  KEBON_JERUK:   { name: 'Halte Kebon Jeruk',      lat: -6.2050, lng: 106.7720 },

  // Terminals / others
  CILILITAN:     { name: 'Terminal Cililitan',     lat: -6.2618, lng: 106.8588 },
  KP_RAMBUTAN_T: { name: 'Terminal Kampung Rambutan', lat: -6.3091, lng: 106.8800 },
};

const DEFAULT_JADWAL = ['06:00', '06:30', '07:00', '07:30', '08:00', '09:00', '12:00', '14:00', '16:00', '17:00', '18:00', '19:00'];

/** Build a route from a compact spec. */
function r({ originStop, midStops = [], walkEnd = 5, walkStart = 3, modes, price, campus, jadwal }) {
  const initialWalk = { type: 'walk', durationMin: walkStart, stopName: originStop.name };
  const transitSteps = midStops.map((m) => ({
    type: m.mode,
    durationMin: m.dur,
    stopName: m.stop.name,
    line: m.via || '',
  }));
  const finalWalk = { type: 'walk', durationMin: walkEnd, stopName: campus.name };
  const steps = [initialWalk, ...transitSteps, finalWalk];
  const durationMin = steps.reduce((s, x) => s + (x.durationMin || 0), 0);

  const waypoints = [
    { lat: originStop.lat, lng: originStop.lng, stopName: originStop.name, transitMode: 'walk' },
    ...midStops.map((m) => ({ lat: m.stop.lat, lng: m.stop.lng, stopName: m.stop.name, transitMode: m.mode })),
    { lat: campus.lat, lng: campus.lng, stopName: campus.name, transitMode: 'walk' },
  ];

  return {
    origin: originStop.name,
    destinationCampus: campus._id,
    modes,
    durationMin,
    price,
    steps,
    waypoints,
    jadwal: jadwal || DEFAULT_JADWAL,
  };
}

function buildRoutes(c) {
  const get = (q) => c.find((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  const ANGGREK = get('Anggrek');
  const KIJANG  = get('Kijang');
  const SYAHDAN = get('Syahdan');
  const JWC     = get('JWC');
  const AS      = get('Alam Sutera - Kampus Utama');
  const ASX     = get('Annex');
  const BSD     = get('BSD - Kampus Utama');
  const BSDSCS  = get('Computer Science');
  const BEKASIC = get('Bekasi - Kampus');
  const BANDUNG = get('Bandung');
  const MALANG  = get('Malang');
  const SEMARANG= get('Semarang');
  const MEDAN   = get('Medan');
  const ONLINE  = get('Online');

  const routes = [];

  // --- KEMANGGISAN trio (Anggrek/Kijang/Syahdan) -- 8 routes each = 24
  for (const camp of [ANGGREK, KIJANG, SYAHDAN]) {
    routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
      { stop: S.PALMERAH, dur: 18, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'TransJakarta'], price: 6500, campus: camp }));

    routes.push(r({ originStop: S.SUDIRMAN, midStops: [
      { stop: S.TANAH_ABANG, dur: 6, mode: 'KRL', via: 'KRL Cikarang' },
      { stop: S.PALMERAH, dur: 7, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL'], price: 7500, campus: camp }));

    routes.push(r({ originStop: S.BLOK_M, midStops: [
      { stop: S.SENAYAN, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
      { stop: S.GROGOL, dur: 20, mode: 'TransJakarta', via: 'Koridor 8' },
      { stop: S.KEBON_JERUK, dur: 8, mode: 'TransJakarta', via: 'Koridor 8' },
    ], walkEnd: 6, modes: ['TransJakarta'], price: 3500, campus: camp }));

    routes.push(r({ originStop: S.VELODROME, midStops: [
      { stop: S.DUKUH_ATAS, dur: 28, mode: 'LRT', via: 'LRT Jabodebek' },
      { stop: S.PALMERAH, dur: 12, mode: 'TransJakarta', via: 'Koridor 8' },
    ], walkEnd: 7, modes: ['LRT', 'TransJakarta'], price: 8500, campus: camp }));

    routes.push(r({ originStop: S.BOGOR, midStops: [
      { stop: S.MANGGARAI, dur: 65, mode: 'KRL', via: 'KRL Bogor' },
      { stop: S.TANAH_ABANG, dur: 9, mode: 'KRL', via: 'KRL Tanah Abang' },
      { stop: S.PALMERAH, dur: 6, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL'], price: 9500, campus: camp }));

    routes.push(r({ originStop: S.DEPOK, midStops: [
      { stop: S.MANGGARAI, dur: 35, mode: 'KRL', via: 'KRL Bogor' },
      { stop: S.PALMERAH, dur: 14, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL'], price: 7000, campus: camp }));

    routes.push(r({ originStop: S.PLUIT, midStops: [
      { stop: S.HARMONI, dur: 22, mode: 'TransJakarta', via: 'Koridor 12' },
      { stop: S.GROGOL, dur: 14, mode: 'TransJakarta', via: 'Koridor 8' },
      { stop: S.KEBON_JERUK, dur: 9, mode: 'TransJakarta', via: 'Koridor 8' },
    ], walkEnd: 6, modes: ['TransJakarta'], price: 3500, campus: camp }));

    routes.push(r({ originStop: S.JAKARTA_KOTA, midStops: [
      { stop: S.MANGGARAI, dur: 18, mode: 'KRL', via: 'KRL Kota' },
      { stop: S.TANAH_ABANG, dur: 8, mode: 'KRL', via: 'KRL Tanah Abang' },
      { stop: S.PALMERAH, dur: 6, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL'], price: 8000, campus: camp }));
  }

  // --- JWC (Senayan) - 8 routes
  routes.push(r({ originStop: S.BLOK_M, midStops: [
    { stop: S.SENAYAN, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 5, modes: ['TransJakarta'], price: 3500, campus: JWC }));
  routes.push(r({ originStop: S.SUDIRMAN, midStops: [
    { stop: S.PALMERAH, dur: 14, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 10, modes: ['KRL'], price: 6500, campus: JWC }));
  routes.push(r({ originStop: S.DUKUH_ATAS, midStops: [
    { stop: S.SENAYAN, dur: 9, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 5, modes: ['LRT', 'TransJakarta'], price: 5500, campus: JWC }));
  routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
    { stop: S.SENAYAN, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 5, modes: ['TransJakarta'], price: 3500, campus: JWC }));
  routes.push(r({ originStop: S.LEBAK_BULUS, midStops: [
    { stop: S.BLOK_M, dur: 14, mode: 'TransJakarta', via: 'Koridor 8' },
    { stop: S.SENAYAN, dur: 10, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 5, modes: ['TransJakarta'], price: 3500, campus: JWC }));
  routes.push(r({ originStop: S.PONDOK_RANJI, midStops: [
    { stop: S.PALMERAH, dur: 24, mode: 'KRL', via: 'KRL Rangkasbitung' },
    { stop: S.SENAYAN, dur: 9, mode: 'TransJakarta', via: 'Koridor 8' },
  ], walkEnd: 7, modes: ['KRL', 'TransJakarta'], price: 7500, campus: JWC }));
  routes.push(r({ originStop: S.PLUIT, midStops: [
    { stop: S.HARMONI, dur: 22, mode: 'TransJakarta', via: 'Koridor 12' },
    { stop: S.SENAYAN, dur: 18, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 5, modes: ['TransJakarta'], price: 3500, campus: JWC }));
  routes.push(r({ originStop: S.DEPOK, midStops: [
    { stop: S.MANGGARAI, dur: 35, mode: 'KRL', via: 'KRL Bogor' },
    { stop: S.SUDIRMAN, dur: 8, mode: 'KRL', via: 'KRL Bogor' },
    { stop: S.SENAYAN, dur: 7, mode: 'TransJakarta', via: 'Koridor 1' },
  ], walkEnd: 6, modes: ['KRL', 'TransJakarta'], price: 8000, campus: JWC }));

  // --- ALAM SUTERA (Utama + Annex) - 8 routes each
  for (const camp of [AS, ASX]) {
    routes.push(r({ originStop: S.SUDIMARA, midStops: [
      { stop: S.SERPONG, dur: 15, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 5500, campus: camp }));
    routes.push(r({ originStop: S.PONDOK_RANJI, midStops: [
      { stop: S.SUDIMARA, dur: 6, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.SERPONG, dur: 14, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 6000, campus: camp }));
    routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
      { stop: S.PALMERAH, dur: 7, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.SUDIMARA, dur: 22, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.SERPONG, dur: 12, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 8500, campus: camp }));
    routes.push(r({ originStop: S.LEBAK_BULUS, midStops: [
      { stop: S.SUDIMARA, dur: 28, mode: 'Mikrotrans', via: 'JAK-M01' },
    ], walkEnd: 12, modes: ['Mikrotrans'], price: 4500, campus: camp }));
    routes.push(r({ originStop: S.SERPONG, midStops: [], walkEnd: 14, modes: ['Mikrotrans'], price: 3500, campus: camp }));
    routes.push(r({ originStop: S.SUDIRMAN, midStops: [
      { stop: S.TANAH_ABANG, dur: 6, mode: 'KRL', via: 'KRL Cikarang' },
      { stop: S.PALMERAH, dur: 7, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.SERPONG, dur: 35, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 10, modes: ['KRL', 'Mikrotrans'], price: 9500, campus: camp }));
    routes.push(r({ originStop: S.TANGERANG_ST, midStops: [
      { stop: S.SERPONG, dur: 38, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 12, modes: ['KRL', 'Mikrotrans'], price: 7500, campus: camp }));
    routes.push(r({ originStop: S.BLOK_M, midStops: [
      { stop: S.LEBAK_BULUS, dur: 18, mode: 'TransJakarta', via: 'Koridor 8' },
      { stop: S.SERPONG, dur: 34, mode: 'Mikrotrans', via: 'JAK-AS01' },
    ], walkEnd: 10, modes: ['TransJakarta', 'Mikrotrans'], price: 5500, campus: camp }));
  }

  // --- BSD (Utama + SCS) - 8 routes each
  for (const camp of [BSD, BSDSCS]) {
    routes.push(r({ originStop: S.CISAUK, midStops: [], walkEnd: 6, modes: ['Mikrotrans'], price: 3500, campus: camp }));
    routes.push(r({ originStop: S.SERPONG, midStops: [
      { stop: S.CISAUK, dur: 8, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 4500, campus: camp }));
    routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
      { stop: S.PALMERAH, dur: 7, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.CISAUK, dur: 42, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 9000, campus: camp }));
    routes.push(r({ originStop: S.SUDIRMAN, midStops: [
      { stop: S.TANAH_ABANG, dur: 6, mode: 'KRL', via: 'KRL Cikarang' },
      { stop: S.CISAUK, dur: 49, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 10, modes: ['KRL', 'Mikrotrans'], price: 9500, campus: camp }));
    routes.push(r({ originStop: S.LEBAK_BULUS, midStops: [
      { stop: S.SERPONG, dur: 34, mode: 'Mikrotrans', via: 'JAK-BSD01' },
      { stop: S.CISAUK, dur: 8, mode: 'Mikrotrans', via: 'JAK-BSD01' },
    ], walkEnd: 10, modes: ['Mikrotrans'], price: 5500, campus: camp }));
    routes.push(r({ originStop: S.SUDIMARA, midStops: [
      { stop: S.SERPONG, dur: 15, mode: 'KRL', via: 'KRL Rangkasbitung' },
      { stop: S.CISAUK, dur: 8, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 6000, campus: camp }));
    routes.push(r({ originStop: S.PLUIT, midStops: [
      { stop: S.HARMONI, dur: 22, mode: 'TransJakarta', via: 'Koridor 12' },
      { stop: S.GROGOL, dur: 14, mode: 'TransJakarta', via: 'Koridor 8' },
      { stop: S.SERPONG, dur: 38, mode: 'Mikrotrans', via: 'JAK-BSD01' },
      { stop: S.CISAUK, dur: 8, mode: 'Mikrotrans', via: 'JAK-BSD01' },
    ], walkEnd: 10, modes: ['TransJakarta', 'Mikrotrans'], price: 7000, campus: camp }));
    routes.push(r({ originStop: S.BOGOR, midStops: [
      { stop: S.MANGGARAI, dur: 65, mode: 'KRL', via: 'KRL Bogor' },
      { stop: S.TANAH_ABANG, dur: 9, mode: 'KRL', via: 'KRL Tanah Abang' },
      { stop: S.CISAUK, dur: 42, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 8, modes: ['KRL', 'Mikrotrans'], price: 11000, campus: camp }));
  }

  // --- BEKASI - 8 routes
  routes.push(r({ originStop: S.BEKASI_BARAT, midStops: [], walkEnd: 12, modes: ['LRT'], price: 3500, campus: BEKASIC }));
  routes.push(r({ originStop: S.BEKASI, midStops: [], walkEnd: 15, modes: ['KRL'], price: 3500, campus: BEKASIC }));
  routes.push(r({ originStop: S.DUKUH_ATAS, midStops: [
    { stop: S.CAWANG, dur: 18, mode: 'LRT', via: 'LRT Jabodebek' },
    { stop: S.JATIBENING, dur: 8, mode: 'LRT', via: 'LRT Bekasi Line' },
    { stop: S.BEKASI_BARAT, dur: 18, mode: 'LRT', via: 'LRT Bekasi Line' },
  ], walkEnd: 8, modes: ['LRT'], price: 8500, campus: BEKASIC }));
  routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
    { stop: S.MANGGARAI, dur: 8, mode: 'KRL', via: 'KRL Cikarang' },
    { stop: S.BEKASI, dur: 32, mode: 'KRL', via: 'KRL Cikarang' },
  ], walkEnd: 12, modes: ['KRL'], price: 8500, campus: BEKASIC }));
  routes.push(r({ originStop: S.JATINEGARA, midStops: [
    { stop: S.BEKASI, dur: 22, mode: 'KRL', via: 'KRL Cikarang' },
  ], walkEnd: 12, modes: ['KRL'], price: 5500, campus: BEKASIC }));
  routes.push(r({ originStop: S.CAKUNG, midStops: [
    { stop: S.BEKASI, dur: 12, mode: 'KRL', via: 'KRL Cikarang' },
  ], walkEnd: 10, modes: ['KRL'], price: 4500, campus: BEKASIC }));
  routes.push(r({ originStop: S.CAWANG, midStops: [
    { stop: S.JATIBENING, dur: 8, mode: 'LRT', via: 'LRT Bekasi Line' },
    { stop: S.BEKASI_BARAT, dur: 18, mode: 'LRT', via: 'LRT Bekasi Line' },
  ], walkEnd: 8, modes: ['LRT'], price: 7500, campus: BEKASIC }));
  routes.push(r({ originStop: S.KALIDERES, midStops: [
    { stop: S.HARMONI, dur: 32, mode: 'TransJakarta', via: 'Koridor 3' },
    { stop: S.PULOGADUNG, dur: 38, mode: 'TransJakarta', via: 'Koridor 2' },
  ], walkEnd: 15, modes: ['TransJakarta'], price: 3500, campus: BEKASIC }));

  // --- BONUS variants (variasi origin tambahan untuk hit 100+ rute) ---
  // Extra: KP Rambutan/Cibubur → semua kampus Kemanggisan via TJ + LRT
  for (const camp of [ANGGREK, KIJANG, SYAHDAN, JWC]) {
    routes.push(r({ originStop: S.KP_RAMBUTAN, midStops: [
      { stop: S.DUKUH_ATAS, dur: 32, mode: 'LRT', via: 'LRT Jabodebek' },
      { stop: S.SENAYAN, dur: 8, mode: 'TransJakarta', via: 'Koridor 1' },
    ], walkEnd: 8, modes: ['LRT', 'TransJakarta'], price: 8500, campus: camp }));
    routes.push(r({ originStop: S.RAGUNAN, midStops: [
      { stop: S.BLOK_M, dur: 18, mode: 'TransJakarta', via: 'Koridor 6' },
      { stop: S.SENAYAN, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
    ], walkEnd: 8, modes: ['TransJakarta'], price: 3500, campus: camp }));
  }
  // Extra: Citayam/UI ke Alam Sutera dan BSD via Manggarai
  for (const camp of [AS, BSD]) {
    routes.push(r({ originStop: S.CITAYAM, midStops: [
      { stop: S.MANGGARAI, dur: 42, mode: 'KRL', via: 'KRL Bogor' },
      { stop: S.TANAH_ABANG, dur: 9, mode: 'KRL', via: 'KRL Tanah Abang' },
      { stop: S.SERPONG, dur: 38, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 10, modes: ['KRL', 'Mikrotrans'], price: 10000, campus: camp }));
    routes.push(r({ originStop: S.UI_KRL, midStops: [
      { stop: S.MANGGARAI, dur: 32, mode: 'KRL', via: 'KRL Bogor' },
      { stop: S.TANAH_ABANG, dur: 9, mode: 'KRL', via: 'KRL Tanah Abang' },
      { stop: S.SERPONG, dur: 38, mode: 'KRL', via: 'KRL Rangkasbitung' },
    ], walkEnd: 10, modes: ['KRL', 'Mikrotrans'], price: 9500, campus: camp }));
  }
  // Extra: Bekasi extra routes
  routes.push(r({ originStop: S.PULOGADUNG, midStops: [
    { stop: S.BEKASI, dur: 25, mode: 'TransJakarta', via: 'Koridor 11' },
  ], walkEnd: 12, modes: ['TransJakarta'], price: 3500, campus: BEKASIC }));
  routes.push(r({ originStop: S.HARMONI, midStops: [
    { stop: S.PULOGADUNG, dur: 28, mode: 'TransJakarta', via: 'Koridor 2' },
    { stop: S.BEKASI, dur: 28, mode: 'TransJakarta', via: 'Koridor 11' },
  ], walkEnd: 12, modes: ['TransJakarta'], price: 3500, campus: BEKASIC }));
  routes.push(r({ originStop: S.HARJAMUKTI, midStops: [
    { stop: S.CAWANG, dur: 38, mode: 'LRT', via: 'LRT Jabodebek' },
    { stop: S.BEKASI_BARAT, dur: 22, mode: 'LRT', via: 'LRT Bekasi Line' },
  ], walkEnd: 10, modes: ['LRT'], price: 9500, campus: BEKASIC }));
  // Extra: BSD SCS via Cibubur
  routes.push(r({ originStop: S.CIBUBUR, midStops: [
    { stop: S.HARJAMUKTI, dur: 8, mode: 'LRT', via: 'LRT Jabodebek' },
    { stop: S.DUKUH_ATAS, dur: 48, mode: 'LRT', via: 'LRT Jabodebek' },
    { stop: S.TANAH_ABANG, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
    { stop: S.CISAUK, dur: 42, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 10, modes: ['LRT', 'TransJakarta', 'KRL', 'Mikrotrans'], price: 14000, campus: BSDSCS }));
  // Extra: Online (4 more)
  routes.push(r({ originStop: S.SUDIRMAN, midStops: [
    { stop: S.PALMERAH, dur: 9, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 8, modes: ['KRL'], price: 7500, campus: ONLINE }));
  routes.push(r({ originStop: S.JAKARTA_KOTA, midStops: [
    { stop: S.MANGGARAI, dur: 18, mode: 'KRL', via: 'KRL Kota' },
    { stop: S.PALMERAH, dur: 18, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 8, modes: ['KRL'], price: 8000, campus: ONLINE }));

  // --- BANDUNG - 4 intercity
  routes.push({
    origin: 'Stasiun Gambir', destinationCampus: BANDUNG._id, modes: ['KRL'],
    durationMin: 200, price: 150000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: 'Stasiun Gambir' },
      { type: 'KRL', durationMin: 180, stopName: 'Gambir - Bandung', line: 'Argo Parahyangan' },
      { type: 'walk', durationMin: 15, stopName: BANDUNG.name },
    ],
    waypoints: [
      { lat: S.GAMBIR.lat, lng: S.GAMBIR.lng, stopName: S.GAMBIR.name, transitMode: 'walk' },
      { lat: -6.9148, lng: 107.6024, stopName: 'Stasiun Bandung', transitMode: 'KRL' },
      { lat: BANDUNG.lat, lng: BANDUNG.lng, stopName: BANDUNG.name, transitMode: 'walk' },
    ],
    jadwal: ['05:30', '07:00', '09:00', '11:00', '14:00', '17:00', '20:00'],
  });
  routes.push({
    origin: 'Terminal Cililitan', destinationCampus: BANDUNG._id, modes: ['Mikrotrans'],
    durationMin: 215, price: 130000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: 'Terminal Cililitan' },
      { type: 'Mikrotrans', durationMin: 200, stopName: 'Shuttle Jakarta-Bandung', line: 'X-Trans / Cititrans' },
      { type: 'walk', durationMin: 10, stopName: BANDUNG.name },
    ],
    waypoints: [
      { lat: S.CILILITAN.lat, lng: S.CILILITAN.lng, stopName: S.CILILITAN.name, transitMode: 'walk' },
      { lat: BANDUNG.lat, lng: BANDUNG.lng, stopName: BANDUNG.name, transitMode: 'Mikrotrans' },
    ],
    jadwal: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
  });
  routes.push({
    origin: 'Stasiun Jakarta Kota', destinationCampus: BANDUNG._id, modes: ['KRL'],
    durationMin: 240, price: 110000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: 'Stasiun Jakarta Kota' },
      { type: 'KRL', durationMin: 25, stopName: 'Kota - Gambir', line: 'KRL Bogor (transit)' },
      { type: 'walk', durationMin: 5, stopName: 'Transit Gambir' },
      { type: 'KRL', durationMin: 195, stopName: 'Gambir - Bandung', line: 'Argo Parahyangan' },
      { type: 'walk', durationMin: 10, stopName: BANDUNG.name },
    ],
    waypoints: [
      { lat: S.JAKARTA_KOTA.lat, lng: S.JAKARTA_KOTA.lng, stopName: S.JAKARTA_KOTA.name, transitMode: 'walk' },
      { lat: S.GAMBIR.lat, lng: S.GAMBIR.lng, stopName: S.GAMBIR.name, transitMode: 'KRL' },
      { lat: BANDUNG.lat, lng: BANDUNG.lng, stopName: BANDUNG.name, transitMode: 'KRL' },
    ],
    jadwal: ['06:00', '08:00', '11:00', '14:00', '17:00'],
  });
  routes.push({
    origin: 'Halte Lebak Bulus', destinationCampus: BANDUNG._id, modes: ['Mikrotrans'],
    durationMin: 230, price: 135000,
    steps: [
      { type: 'walk', durationMin: 3, stopName: S.LEBAK_BULUS.name },
      { type: 'Mikrotrans', durationMin: 220, stopName: 'Shuttle Lebak Bulus - Bandung', line: 'Cititrans / DayTrans' },
      { type: 'walk', durationMin: 7, stopName: BANDUNG.name },
    ],
    waypoints: [
      { lat: S.LEBAK_BULUS.lat, lng: S.LEBAK_BULUS.lng, stopName: S.LEBAK_BULUS.name, transitMode: 'walk' },
      { lat: BANDUNG.lat, lng: BANDUNG.lng, stopName: BANDUNG.name, transitMode: 'Mikrotrans' },
    ],
    jadwal: ['05:00', '07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
  });

  // --- MALANG - 2 intercity
  routes.push({
    origin: 'Stasiun Pasar Senen', destinationCampus: MALANG._id, modes: ['KRL'],
    durationMin: 900, price: 380000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: S.PASAR_SENEN.name },
      { type: 'KRL', durationMin: 880, stopName: 'Jakarta - Malang', line: 'Kereta Matarmaja / Brawijaya' },
      { type: 'walk', durationMin: 15, stopName: MALANG.name },
    ],
    waypoints: [
      { lat: S.PASAR_SENEN.lat, lng: S.PASAR_SENEN.lng, stopName: S.PASAR_SENEN.name, transitMode: 'walk' },
      { lat: -7.9785, lng: 112.6379, stopName: 'Stasiun Malang', transitMode: 'KRL' },
      { lat: MALANG.lat, lng: MALANG.lng, stopName: MALANG.name, transitMode: 'walk' },
    ],
    jadwal: ['13:30', '17:00', '20:00'],
  });
  routes.push({
    origin: 'Stasiun Gambir', destinationCampus: MALANG._id, modes: ['KRL'],
    durationMin: 870, price: 540000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: S.GAMBIR.name },
      { type: 'KRL', durationMin: 850, stopName: 'Jakarta - Malang Eksekutif', line: 'Gajayana' },
      { type: 'walk', durationMin: 15, stopName: MALANG.name },
    ],
    waypoints: [
      { lat: S.GAMBIR.lat, lng: S.GAMBIR.lng, stopName: S.GAMBIR.name, transitMode: 'walk' },
      { lat: -7.9785, lng: 112.6379, stopName: 'Stasiun Malang', transitMode: 'KRL' },
      { lat: MALANG.lat, lng: MALANG.lng, stopName: MALANG.name, transitMode: 'walk' },
    ],
    jadwal: ['18:30'],
  });

  // --- SEMARANG - 2 intercity
  routes.push({
    origin: 'Stasiun Gambir', destinationCampus: SEMARANG._id, modes: ['KRL'],
    durationMin: 360, price: 410000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: S.GAMBIR.name },
      { type: 'KRL', durationMin: 340, stopName: 'Gambir - Semarang Tawang', line: 'Argo Muria / Sembrani' },
      { type: 'walk', durationMin: 15, stopName: SEMARANG.name },
    ],
    waypoints: [
      { lat: S.GAMBIR.lat, lng: S.GAMBIR.lng, stopName: S.GAMBIR.name, transitMode: 'walk' },
      { lat: -6.9645, lng: 110.4275, stopName: 'Stasiun Semarang Tawang', transitMode: 'KRL' },
      { lat: SEMARANG.lat, lng: SEMARANG.lng, stopName: SEMARANG.name, transitMode: 'walk' },
    ],
    jadwal: ['07:00', '15:30', '21:00'],
  });
  routes.push({
    origin: 'Stasiun Pasar Senen', destinationCampus: SEMARANG._id, modes: ['KRL'],
    durationMin: 420, price: 220000,
    steps: [
      { type: 'walk', durationMin: 5, stopName: S.PASAR_SENEN.name },
      { type: 'KRL', durationMin: 400, stopName: 'Pasar Senen - Semarang Poncol', line: 'Kertajaya / Jayabaya' },
      { type: 'walk', durationMin: 15, stopName: SEMARANG.name },
    ],
    waypoints: [
      { lat: S.PASAR_SENEN.lat, lng: S.PASAR_SENEN.lng, stopName: S.PASAR_SENEN.name, transitMode: 'walk' },
      { lat: -6.9707, lng: 110.4226, stopName: 'Stasiun Semarang Poncol', transitMode: 'KRL' },
      { lat: SEMARANG.lat, lng: SEMARANG.lng, stopName: SEMARANG.name, transitMode: 'walk' },
    ],
    jadwal: ['10:00', '14:00', '22:30'],
  });

  // --- MEDAN - 1 intercity (mostly flight, kept symbolic)
  routes.push({
    origin: 'Bandara Soekarno-Hatta', destinationCampus: MEDAN._id, modes: ['Mikrotrans'],
    durationMin: 180, price: 950000,
    steps: [
      { type: 'walk', durationMin: 10, stopName: 'Bandara Soekarno-Hatta T3' },
      { type: 'Mikrotrans', durationMin: 150, stopName: 'Penerbangan CGK - KNO', line: 'Garuda / Citilink / Lion' },
      { type: 'walk', durationMin: 20, stopName: MEDAN.name },
    ],
    waypoints: [
      { lat: -6.1256, lng: 106.6559, stopName: 'Bandara CGK', transitMode: 'walk' },
      { lat: 3.6422, lng: 98.8852, stopName: 'Bandara Kualanamu', transitMode: 'Mikrotrans' },
      { lat: MEDAN.lat, lng: MEDAN.lng, stopName: MEDAN.name, transitMode: 'walk' },
    ],
    jadwal: ['05:00', '07:00', '10:00', '12:00', '15:00', '17:00', '19:00'],
  });

  // --- ONLINE LEARNING (Kemanggisan address) - 4 routes (same like Anggrek area)
  routes.push(r({ originStop: S.TANAH_ABANG, midStops: [
    { stop: S.PALMERAH, dur: 18, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 8, modes: ['KRL'], price: 6500, campus: ONLINE }));
  routes.push(r({ originStop: S.BLOK_M, midStops: [
    { stop: S.SENAYAN, dur: 12, mode: 'TransJakarta', via: 'Koridor 1' },
    { stop: S.GROGOL, dur: 20, mode: 'TransJakarta', via: 'Koridor 8' },
    { stop: S.KEBON_JERUK, dur: 8, mode: 'TransJakarta', via: 'Koridor 8' },
  ], walkEnd: 6, modes: ['TransJakarta'], price: 3500, campus: ONLINE }));
  routes.push(r({ originStop: S.VELODROME, midStops: [
    { stop: S.DUKUH_ATAS, dur: 28, mode: 'LRT', via: 'LRT Jabodebek' },
    { stop: S.PALMERAH, dur: 12, mode: 'TransJakarta', via: 'Koridor 8' },
  ], walkEnd: 7, modes: ['LRT', 'TransJakarta'], price: 8500, campus: ONLINE }));
  routes.push(r({ originStop: S.DEPOK, midStops: [
    { stop: S.MANGGARAI, dur: 35, mode: 'KRL', via: 'KRL Bogor' },
    { stop: S.PALMERAH, dur: 14, mode: 'KRL', via: 'KRL Rangkasbitung' },
  ], walkEnd: 8, modes: ['KRL'], price: 7000, campus: ONLINE }));

  return routes;
}

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
  const routes = buildRoutes(campuses);
  await Route.insertMany(routes);

  console.log(`✓ Seeded ${campuses.length} campuses, ${routes.length} routes, 2 users.`);
  console.log('  Admin: admin@binus.edu / admin123');
  console.log('  User:  student@binus.ac.id / student123');
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
