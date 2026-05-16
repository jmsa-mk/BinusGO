import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Wallet, Bookmark, BookmarkCheck, LogIn, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransitStep from './TransitStep.jsx';
import BinusMap from './map/BinusMap.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/binusgo.js';

function fmtTime(addMin = 0) {
  const d = new Date(Date.now() + addMin * 60000);
  return d.toTimeString().slice(0, 5);
}

export default function RouteCard({ route, badge, onHover, onLeave, highlighted, savedIds = new Set(), onSavedChange }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('Jadwal');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const dep = fmtTime(0);
  const arr = fmtTime(route.durationMin);

  const isSaved = route._id && savedIds.has(route._id);

  async function toggleSave(e) {
    e.stopPropagation();
    if (!user) { setToast('Login dulu untuk menyimpan'); setTimeout(() => setToast(''), 2200); return; }
    if (!route._id) return;
    setBusy(true);
    try {
      if (isSaved) {
        await api.unsaveRoute(route._id);
        setToast('Dihapus dari favorit');
      } else {
        await api.saveRoute(route._id);
        setToast('✓ Rute tersimpan ke favorit');
      }
      onSavedChange?.();
    } catch (e) {
      setToast(e.message || 'Gagal menyimpan');
    } finally {
      setBusy(false);
      setTimeout(() => setToast(''), 2200);
    }
  }

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`bg-white rounded-2xl p-4 transition border ${
        highlighted ? 'border-primary shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-textmuted flex items-center gap-1 mb-0.5 truncate">
            <MapPin size={11} className="text-primary flex-shrink-0" />
            <span className="truncate">Dari: <b className="text-textmain">{route.origin}</b></span>
          </div>
          <div className="font-heading font-bold text-lg">{dep} – {arr}</div>
          <div className="text-xs text-textmuted flex items-center gap-1">
            <Clock size={12} /> {Math.floor(route.durationMin / 60)} j {route.durationMin % 60} mnt
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
              badge === 'Tercepat' ? 'bg-accent text-white' : 'bg-success/15 text-success'
            }`}>
              {badge}
            </span>
          )}
          <button
            onClick={toggleSave}
            disabled={busy}
            title={user ? (isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit') : 'Login untuk menyimpan'}
            className={`p-2 rounded-lg transition flex-shrink-0 ${
              isSaved ? 'bg-accent/15 text-accent' : 'bg-slate-100 text-textmuted hover:bg-primary/10 hover:text-primary'
            } disabled:opacity-50`}
          >
            {!user ? <LogIn size={16} /> : isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>

      {toast && (
        <div className="mb-2 text-xs px-2 py-1.5 bg-success/10 text-success rounded-lg flex items-center justify-between">
          <span>{toast}</span>
          {!user && toast.includes('Login') && (
            <Link to="/login" className="font-bold underline">Masuk →</Link>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 mb-3">
        {route.steps.map((s, i) => (
          <span key={i} className="flex items-center gap-1">
            <TransitStep step={s} />
            {i < route.steps.length - 1 && <span className="text-textmuted text-xs">→</span>}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1 text-sm font-mono font-semibold">
          <Wallet size={14} className="text-textmuted" />
          Rp {route.price.toLocaleString('id-ID')}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="text-primary text-sm font-semibold flex items-center gap-1">
          {open ? 'Tutup' : 'Detail'} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex gap-2 mb-3">
            {['Jadwal', 'Info Transit', 'Peta Rute'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tab === t ? 'bg-primary text-white' : 'bg-slate-100 text-textmuted'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'Jadwal' && (
            <div className="flex flex-wrap gap-1.5">
              {(route.jadwal || []).map((t) => (
                <span key={t} className="px-2 py-1 rounded-md bg-slate-50 font-mono text-xs">{t}</span>
              ))}
            </div>
          )}
          {tab === 'Info Transit' && (
            <ol className="space-y-2">
              {route.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                  <span><b>{s.type === 'walk' ? 'Jalan kaki' : s.type}</b> {s.durationMin} mnt - {s.stopName}{s.line ? ` (${s.line})` : ''}</span>
                </li>
              ))}
            </ol>
          )}
          {tab === 'Peta Rute' && (
            <div className="h-[300px] rounded-xl overflow-hidden">
              <BinusMap mini route={route} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
