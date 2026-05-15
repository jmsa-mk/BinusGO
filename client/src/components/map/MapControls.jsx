import { useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Eye, EyeOff, Crosshair } from 'lucide-react';

export default function MapControls({
  getResetBounds,
  onToggleCampuses, showCampuses,
  onToggleAllRoutes, showAllRoutes,
  onTogglePickMode, pickMode,
  canReset,
}) {
  const map = useMap();

  function resetView() {
    const b = getResetBounds?.();
    if (b) map.flyToBounds(b, { padding: [50, 50], duration: 0.8 });
  }

  return (
    <>
      <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
        <Btn onClick={() => map.zoomIn()} title="Zoom in"><ZoomIn size={16} /></Btn>
        <Btn onClick={() => map.zoomOut()} title="Zoom out"><ZoomOut size={16} /></Btn>
        <Btn onClick={resetView} title="Kembali ke Rute" disabled={!canReset}>
          <RotateCcw size={16} />
        </Btn>
      </div>

      <div className="absolute left-3 top-3 z-[400] flex flex-col gap-2">
        <Btn onClick={onTogglePickMode} active={pickMode}
          title={pickMode ? 'Klik di peta untuk set asal (atau matikan)' : 'Pilih titik asal di peta'}>
          <Crosshair size={16} />
        </Btn>
        <Btn onClick={onToggleCampuses} active={showCampuses}
          title={showCampuses ? 'Sembunyikan kampus' : 'Tampilkan semua kampus'}>
          {showCampuses ? <Eye size={16} /> : <EyeOff size={16} />}
        </Btn>
        <Btn onClick={onToggleAllRoutes} active={showAllRoutes}
          title={showAllRoutes ? 'Hanya rute terpilih' : 'Tampilkan semua rute'}>
          <Layers size={16} />
        </Btn>
      </div>

      {pickMode && (
        <div className="absolute left-1/2 -translate-x-1/2 top-3 z-[400] bg-darkbg text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
          Klik titik manapun di peta untuk menjadikan asal
        </div>
      )}
    </>
  );
}

function Btn({ onClick, title, active, disabled, children }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className={`w-9 h-9 rounded-lg shadow flex items-center justify-center transition ${
        disabled ? 'bg-white/60 text-textmuted/40 cursor-not-allowed'
        : active ? 'bg-primary text-white' : 'bg-white hover:bg-slate-50'
      }`}>
      {children}
    </button>
  );
}
