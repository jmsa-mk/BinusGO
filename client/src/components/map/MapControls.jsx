import { useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';

export default function MapControls({ onReset, onToggleCampuses, showCampuses }) {
  const map = useMap();
  return (
    <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
      <button onClick={() => map.zoomIn()} className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center hover:bg-slate-50">
        <ZoomIn size={16} />
      </button>
      <button onClick={() => map.zoomOut()} className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center hover:bg-slate-50">
        <ZoomOut size={16} />
      </button>
      {onReset && (
        <button onClick={onReset} title="Kembali ke Rute"
          className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center hover:bg-slate-50">
          <RotateCcw size={16} />
        </button>
      )}
      {onToggleCampuses && (
        <button onClick={onToggleCampuses}
          title={showCampuses ? 'Sembunyikan Kampus' : 'Tampilkan Semua Kampus'}
          className={`w-9 h-9 rounded-lg shadow flex items-center justify-center ${
            showCampuses ? 'bg-primary text-white' : 'bg-white hover:bg-slate-50'
          }`}>
          <Layers size={16} />
        </button>
      )}
    </div>
  );
}
