import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown, X, MapPin } from 'lucide-react';

export default function CampusDropdown({ campuses, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const grouped = useMemo(() => {
    const g = {};
    for (const c of campuses) (g[c.cluster] = g[c.cluster] || []).push(c);
    return g;
  }, [campuses]);

  const selected = campuses.find((c) => c._id === value);

  return (
    <div className="relative" ref={ref}>
      {selected ? (
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-3 text-textmain">
          <MapPin size={18} className="text-primary" />
          <span className="flex-1 text-sm font-medium truncate">{selected.name}</span>
          <button onClick={() => onChange('')} className="text-textmuted hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-2 bg-white rounded-xl px-3 py-3 text-left">
          <MapPin size={18} className="text-textmuted" />
          <span className="flex-1 text-sm text-textmuted">Pilih kampus tujuan...</span>
          <ChevronDown size={18} className="text-textmuted" />
        </button>
      )}

      {open && !selected && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-72 overflow-y-auto scrollbar-thin">
          {Object.entries(grouped).map(([cluster, list]) => (
            <div key={cluster}>
              <div className="px-3 py-2 text-[10px] font-mono font-bold text-primary bg-primary/5 sticky top-0">
                {cluster}
              </div>
              {list.map((c) => (
                <button key={c._id}
                  onClick={() => { onChange(c._id); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 border-t border-slate-50">
                  {c.name.replace(/^BINUS.*–\s?/, '')}
                  <div className="text-[11px] text-textmuted">{c.address}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
