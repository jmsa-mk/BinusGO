// Major Jakarta transit hubs (sinkron dengan seed.js)
// Digunakan untuk menemukan stop terdekat dari koordinat asal user.

export const KNOWN_STOPS = [
  // KRL
  { name: 'Stasiun Tanah Abang',   lat: -6.1862, lng: 106.8106 },
  { name: 'Stasiun Sudirman',      lat: -6.2014, lng: 106.8231 },
  { name: 'Stasiun Manggarai',     lat: -6.2105, lng: 106.8503 },
  { name: 'Stasiun Jatinegara',    lat: -6.2155, lng: 106.8704 },
  { name: 'Stasiun Jakarta Kota',  lat: -6.1377, lng: 106.8146 },
  { name: 'Stasiun Pasar Senen',   lat: -6.1740, lng: 106.8434 },
  { name: 'Stasiun Gambir',        lat: -6.1768, lng: 106.8307 },
  { name: 'Stasiun Depok Baru',    lat: -6.4017, lng: 106.8232 },
  { name: 'Stasiun Bogor',         lat: -6.5546, lng: 106.7898 },
  { name: 'Stasiun Bekasi',        lat: -6.2390, lng: 107.0017 },
  { name: 'Stasiun Cakung',        lat: -6.1929, lng: 106.9484 },
  { name: 'Stasiun Tangerang',     lat: -6.1786, lng: 106.6308 },
  { name: 'Stasiun Serpong',       lat: -6.3175, lng: 106.6716 },
  { name: 'Stasiun Cisauk',        lat: -6.3127, lng: 106.6404 },
  { name: 'Stasiun Sudimara',      lat: -6.2696, lng: 106.7165 },
  { name: 'Stasiun Palmerah',      lat: -6.2076, lng: 106.7977 },
  { name: 'Stasiun Pondok Ranji',  lat: -6.2768, lng: 106.7383 },
  { name: 'Stasiun Kebayoran',     lat: -6.2419, lng: 106.7833 },
  { name: 'Stasiun Lenteng Agung', lat: -6.3389, lng: 106.8362 },
  { name: 'Stasiun Universitas Indonesia', lat: -6.3614, lng: 106.8312 },
  { name: 'Stasiun Citayam',       lat: -6.4423, lng: 106.8328 },
  // LRT
  { name: 'Stasiun Dukuh Atas LRT', lat: -6.2007, lng: 106.8227 },
  { name: 'Stasiun Cawang LRT',     lat: -6.2531, lng: 106.8716 },
  { name: 'Stasiun Velodrome',      lat: -6.1944, lng: 106.9003 },
  { name: 'Stasiun Bekasi Barat LRT', lat: -6.2440, lng: 106.9952 },
  { name: 'Stasiun Harjamukti',     lat: -6.4126, lng: 106.8989 },
  { name: 'Stasiun Kampung Rambutan LRT', lat: -6.3122, lng: 106.8836 },
  // TJ haltes
  { name: 'Halte Blok M',           lat: -6.2436, lng: 106.7986 },
  { name: 'Halte Kota TJ',          lat: -6.1377, lng: 106.8146 },
  { name: 'Halte Pluit',            lat: -6.1287, lng: 106.7895 },
  { name: 'Halte Pulogadung',       lat: -6.1880, lng: 106.9075 },
  { name: 'Halte Kalideres',        lat: -6.1597, lng: 106.7039 },
  { name: 'Halte Ragunan',          lat: -6.3105, lng: 106.8222 },
  { name: 'Halte Lebak Bulus',      lat: -6.2895, lng: 106.7762 },
  { name: 'Halte Senayan',          lat: -6.2207, lng: 106.8025 },
  { name: 'Halte Harmoni',          lat: -6.1665, lng: 106.8203 },
  { name: 'Halte Grogol',           lat: -6.1654, lng: 106.7900 },
  { name: 'Halte Kebon Jeruk',      lat: -6.2050, lng: 106.7720 },
  { name: 'Halte Cibubur Junction', lat: -6.3650, lng: 106.8842 },
  { name: 'Terminal Cililitan',     lat: -6.2618, lng: 106.8588 },
];

// Haversine distance in km
export function distKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function findNearestStop(coord) {
  let best = null;
  let bestDist = Infinity;
  for (const s of KNOWN_STOPS) {
    const d = distKm(s, coord);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return { stop: best, distKm: bestDist };
}

// Reverse geocode via Nominatim (free, no API key, rate-limited)
export async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'id,en' } }
    );
    if (!r.ok) throw new Error('geocode failed');
    const data = await r.json();
    const a = data.address || {};
    // Pick the most readable short name
    const short = a.suburb || a.village || a.neighbourhood || a.city_district ||
                  a.town || a.county || a.city || a.road;
    return short || data.display_name?.split(',').slice(0, 2).join(', ') || null;
  } catch {
    return null;
  }
}
