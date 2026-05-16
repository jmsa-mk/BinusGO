import { useEffect, useMemo, useState } from 'react';
import { MapPin, Crosshair, Search, Map as MapIcon } from 'lucide-react';
import CampusDropdown from '../components/CampusDropdown.jsx';
import RouteCard from '../components/RouteCard.jsx';
import BinusMap from '../components/map/BinusMap.jsx';
import MapBottomSheet from '../components/MapBottomSheet.jsx';
import { api } from '../api/binusgo.js';
import { useAuth } from '../context/AuthContext.jsx';
import { findNearestStop, reverseGeocode } from '../data/stops.js';

const SORTS = ['Tercepat', 'Termurah', 'Transit ↓', 'Jalan ↓'];
const MODES = ['Semua', 'Bus', 'KRL', 'LRT', 'Mikrotrans'];

export default function RoutePlanner() {
  const { user } = useAuth();
  const [campuses, setCampuses] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [origin, setOrigin] = useState('');
  const [originCoord, setOriginCoord] = useState(null);
  const [campusId, setCampusId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [fallback, setFallback] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [sort, setSort] = useState('Tercepat');
  const [mode, setMode] = useState('Semua');
  const [mobileMap, setMobileMap] = useState(false);

  useEffect(() => { api.campuses().then(setCampuses).catch(() => {}); }, []);

  async function refreshSaved() {
    if (!user) { setSavedIds(new Set()); return; }
    try {
      const items = await api.savedRoutes();
      setSavedIds(new Set(items.map((x) => x.route?._id || x.route)));
    } catch { setSavedIds(new Set()); }
  }
  useEffect(() => { refreshSaved(); /* eslint-disable-next-line */ }, [user]);

  async function search() {
    if (!campusId) { setErrMsg('Pilih kampus tujuan dulu.'); return; }
    setLoading(true);
    setErrMsg('');
    setFallback(false);
    setSearched(true);
    try {
      const apiMode = mode === 'Bus' ? 'TransJakarta' : mode;
      // Kalau origin user dari koordinat (drag pin / geolocation), pakai nama stasiun terdekat
      // sebagai filter origin di backend supaya hasil lebih relevan
      let searchOrigin = origin;
      if (originCoord && nearestStop?.stop) searchOrigin = nearestStop.stop.name;
      const r = await api.searchRoutes({ origin: searchOrigin, campusId, mode: apiMode });
      const items = Array.isArray(r) ? r : (r.items || []);
      setResults(items);
      setFallback(Array.isArray(r) ? false : !!r.fallback);
    } catch (e) {
      console.error('searchRoutes failed:', e);
      setErrMsg(e.message || 'Gagal mengambil rute. Pastikan server backend berjalan.');
      setResults([]);
    } finally { setLoading(false); }
  }

  async function resolveCoord(coord, fallbackLabel) {
    setOriginCoord(coord);
    const nearest = findNearestStop(coord);
    setNearestStop(nearest);
    setGeocoding(true);
    // Tampilkan label sementara dulu, lalu reverse geocode async
    setOrigin(fallbackLabel || `${coord.lat.toFixed(5)}, ${coord.lng.toFixed(5)}`);
    try {
      const placeName = await reverseGeocode(coord.lat, coord.lng);
      if (placeName) setOrigin(placeName);
    } finally { setGeocoding(false); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => resolveCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'Lokasi Saya'),
      () => alert('Tidak bisa mengakses lokasi'),
    );
  }

  function handleOriginChange(coord) {
    resolveCoord(coord);
  }

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === 'Tercepat') arr.sort((a, b) => a.durationMin - b.durationMin);
    else if (sort === 'Termurah') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'Transit ↓') arr.sort((a, b) => b.steps.filter((s) => s.type !== 'walk').length - a.steps.filter((s) => s.type !== 'walk').length);
    else if (sort === 'Jalan ↓') arr.sort((a, b) => b.steps.filter((s) => s.type === 'walk').length - a.steps.filter((s) => s.type === 'walk').length);
    return arr;
  }, [results, sort]);

  const mapNode = (
    <BinusMap
      campuses={campuses}
      allRoutes={sorted}
      hoveredRoute={hovered}
      selectedRoute={sorted[0]}
      origin={originCoord}
      onOriginChange={handleOriginChange}
      onSelectCampus={(c) => { setCampusId(c._id); setMobileMap(false); }}
    />
  );

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <section className="md:w-2/5 flex flex-col bg-lightbg overflow-hidden">
        <div className="bg-primary text-white p-5 pr-16 md:pr-5 space-y-3">
          <h1 className="font-heading text-xl font-extrabold">Cari Rute Transit</h1>

          <div className="flex items-stretch gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/15 rounded-xl px-3">
              <MapPin size={16} />
              <input
                value={origin} onChange={(e) => setOrigin(e.target.value)}
                placeholder="Dari mana kamu?"
                className="flex-1 bg-transparent outline-none text-sm placeholder-white/60 py-2.5"
              />
            </div>
            <button onClick={useMyLocation} title="Gunakan Lokasi Saya"
              className="px-3 bg-white/15 hover:bg-white/25 rounded-xl flex items-center gap-1 text-xs">
              <Crosshair size={14} />
            </button>
          </div>
          {originCoord && nearestStop?.stop && (
            <div className="text-[11px] text-white/80 -mt-1 bg-white/10 rounded-lg px-2 py-1.5">
              {geocoding && <span className="opacity-80">Mencari nama lokasi… </span>}
              <span>Stasiun terdekat: <b>{nearestStop.stop.name}</b> ({nearestStop.distKm.toFixed(1)} km).</span>
              <br />
              <span className="opacity-70">Rute akan dicari dari stasiun terdekat ini. Drag pin merah untuk pindahkan asal.</span>
            </div>
          )}

          <div className="text-textmain">
            <CampusDropdown campuses={campuses} value={campusId} onChange={setCampusId} />
          </div>

          <button onClick={search} disabled={!campusId || loading}
            className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-60 rounded-xl font-semibold flex items-center justify-center gap-2">
            <Search size={16} /> {loading ? 'Mencari…' : 'Cari Rute'}
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-thin">
            {SORTS.map((s) => (
              <button key={s} onClick={() => setSort(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  sort === s ? 'bg-primary text-white' : 'bg-slate-100 text-textmuted'
                }`}>{s}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {MODES.map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  mode === m ? 'bg-textmain text-white' : 'bg-slate-100 text-textmuted'
                }`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {errMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
              {errMsg}
            </div>
          )}
          {fallback && !loading && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3">
              Tidak ada rute langsung dari <b>{origin}</b>. Menampilkan semua rute ke kampus tujuan sebagai alternatif.
            </div>
          )}
          {loading && [1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-32" />
          ))}
          {!loading && sorted.length === 0 && !errMsg && (
            <div className="text-center text-textmuted py-10 text-sm">
              {searched
                ? <>Tidak ada rute ditemukan ke kampus ini dengan mode <b>{mode}</b>.<br/>Coba pilih mode <b>Semua</b> atau kampus lain.</>
                : campusId
                  ? 'Tekan "Cari Rute" untuk melihat hasil.'
                  : 'Pilih kampus tujuan untuk mulai mencari rute.'}
            </div>
          )}
          {!loading && sorted.map((r, i) => (
            <RouteCard
              key={r._id}
              route={r}
              badge={i === 0 ? 'Tercepat' : (i === 1 ? 'Terpopuler' : null)}
              onHover={() => setHovered(r)}
              onLeave={() => setHovered(null)}
              highlighted={hovered?._id === r._id}
              savedIds={savedIds}
              onSavedChange={refreshSaved}
            />
          ))}
        </div>
      </section>

      <section className="hidden md:block flex-1 relative">{mapNode}</section>

      <button
        onClick={() => setMobileMap(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 px-4 py-3 bg-primary text-white rounded-full shadow-lg flex items-center gap-2 font-semibold">
        <MapIcon size={18} /> Lihat Peta
      </button>
      <MapBottomSheet open={mobileMap} onClose={() => setMobileMap(false)}>
        {mapNode}
      </MapBottomSheet>
    </div>
  );
}
