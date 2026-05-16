import { useEffect, useState } from 'react';
import { Rocket, Trash2, Route as RouteIcon, Clock, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthGate from '../components/AuthGate.jsx';
import { api } from '../api/binusgo.js';

export default function SavedLocations() {
  const { user, loading } = useAuth();
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (user) api.savedRoutes().then(setRoutes).catch(() => {});
  }, [user]);

  async function removeRoute(id) {
    await api.unsaveRouteById(id);
    setRoutes((s) => s.filter((x) => x._id !== id));
  }

  if (loading) return null;
  if (!user) return <AuthGate title="Login untuk menyimpan rute" message="Simpan rute favoritmu, akses lebih cepat setiap saat." />;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Rocket className="text-primary" />
        <h1 className="font-heading text-2xl font-extrabold">Rute Tersimpan</h1>
      </div>
      <p className="text-textmuted mb-6">Rute favoritmu ({routes.length})</p>

      {routes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-textmuted text-sm shadow-sm">
          Belum ada rute tersimpan.<br/>
          Tekan ikon bookmark di kartu rute saat mencari untuk menyimpan ke sini.
        </div>
      ) : (
        <ul className="grid gap-3">
          {routes.map((s) => {
            const r = s.route;
            if (!r) return null;
            return (
              <li key={s._id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                    <RouteIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-1 flex-wrap">
                      <span className="truncate">{r.origin}</span>
                      <ArrowRight size={12} className="text-textmuted flex-shrink-0" />
                      <span className="truncate">{r.destinationCampus?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-textmuted mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11} /> {r.durationMin} mnt</span>
                      <span className="flex items-center gap-1"><Wallet size={11} /> Rp {r.price.toLocaleString('id-ID')}</span>
                      <span className="flex items-center gap-1 flex-wrap">
                        {r.modes.map((m) => <span key={m} className="text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">{m}</span>)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeRoute(s._id)} className="text-textmuted hover:text-red-500 flex-shrink-0 p-1"
                    title="Hapus dari favorit">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
