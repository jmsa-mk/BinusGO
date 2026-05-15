import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Wallet } from 'lucide-react';
import TransitStep from './TransitStep.jsx';
import BinusMap from './map/BinusMap.jsx';

function fmtTime(addMin = 0) {
  const d = new Date(Date.now() + addMin * 60000);
  return d.toTimeString().slice(0, 5);
}

export default function RouteCard({ route, badge, onHover, onLeave, highlighted }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('Jadwal');
  const dep = fmtTime(0);
  const arr = fmtTime(route.durationMin);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`bg-white rounded-2xl p-4 transition border ${
        highlighted ? 'border-primary shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-heading font-bold text-lg">{dep} – {arr}</div>
          <div className="text-xs text-textmuted flex items-center gap-1">
            <Clock size={12} /> {Math.floor(route.durationMin / 60)} j {route.durationMin % 60} mnt
          </div>
        </div>
        {badge && (
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
            badge === 'Tercepat' ? 'bg-accent text-white' : 'bg-success/15 text-success'
          }`}>
            {badge}
          </span>
        )}
      </div>

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
