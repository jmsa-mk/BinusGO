import { useEffect, useMemo, useState } from 'react';
import { MapPin, Crosshair, Search, X, Map as MapIcon } from 'lucide-react';
import CampusDropdown from '../components/CampusDropdown.jsx';
import RouteCard from '../components/RouteCard.jsx';
import BinusMap from '../components/map/BinusMap.jsx';
import { api } from '../api/binusgo.js';

const SORTS = ['Tercepat', 'Termurah', 'Transit ↓', 'Jalan ↓'];
const MODES = ['Semua', 'Bus', 'KRL', 'LRT', 'Mikrotrans'];

export default function RoutePlanner() {
  const [campuses, setCampuses] = useState([]);
  const [origin, setOrigin] = useState('');
  const [originCoord, setOriginCoord] = useState(null);
  const [campusId, setCampusId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [sort, setSort] = useState('Tercepat');
  const [mode, setMode] = useState('Semua');
  const [mobileMap, setMobileMap] = useState(false);

  useEffect(() => { api.campuses().then(setCampuses).catch(() => {}); }, []);

  async function search() {
    if (!campusId) return;
    setLoading(true);
    try {
      const apiMode = mode === 'Bus' ? 'TransJakarta' : mode;
      const r = await api.searchRoutes({ origin, campusId, mode: apiMode });
      setResults(r);
    } finally { setLoading(false); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOrigin('Lokasi Saya');
      },
      () => alert('Tidak bisa mengakses lokasi'),
    );
  }

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === 'Tercepat') arr.sort((a, b) => a.durationMin - b.durationMin);
    else if (sort === 'Termurah') arr.sort((a, b) => a.price - b.price);
    else if (sort === 'Transit ↓') arr.sort((a, b) => b.steps.filter((s) => s.type !== 'walk').length - a.steps.filter((s) => s.type !== 'walk').length);
    else if (sort === 'Jalan ↓') arr.sort((a, b) => b.steps.filter((s) => s.type === 'walk').length - a.steps.filter((s) => s.type === 'walk').length);
    return arr;
  }, [results, sort]);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left panel */}
      <section className="md:w-2/5 flex flex-col bg-lightbg overflow-hidden">
        <div className="bg-primary text-white p-5 space-y-3">
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
          {loading && [1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-32" />
          ))}
          {!loading && sorted.length === 0 && (
            <div className="text-center text-textmuted py-10 text-sm">
              {campusId ? 'Tekan "Cari Rute" untuk melihat hasil.' : 'Pilih kampus tujuan untuk mulai mencari rute.'}
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
            />
          ))}
        </div>
      </section>

      {/* Right map panel */}
      <section className="hidden md:block flex-1 relative">
        <BinusMap
          campuses={campuses}
          hoveredRoute={hovered}
          selectedRoute={sorted[0]}
          origin={originCoord}
          onSelectCampus={(c) => setCampusId(c._id)}
        />
      </section>

      {/* Mobile map FAB + overlay */}
      <button
        onClick={() => setMobileMap(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 px-4 py-3 bg-primary text-white rounded-full shadow-lg flex items-center gap-2 font-semibold">
        <MapIcon size={18} /> Lihat Peta
      </button>
      {mobileMap && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="font-bold">Peta Rute</div>
            <button onClick={() => setMobileMap(false)} className="p-1"><X /></button>
          </div>
          <div className="flex-1">
            <BinusMap
              campuses={campuses}
              hoveredRoute={hovered}
              selectedRoute={sorted[0]}
              origin={originCoord}
              onSelectCampus={(c) => { setCampusId(c._id); setMobileMap(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
