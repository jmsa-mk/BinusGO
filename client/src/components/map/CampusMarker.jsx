import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const icon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#5B5FEF;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
    <svg style="transform:rotate(45deg);color:#fff" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -28],
});

export default function CampusMarker({ campus, onSelect }) {
  return (
    <Marker position={[campus.lat, campus.lng]} icon={icon}>
      <Popup>
        <div className="space-y-1">
          <div className="font-bold text-sm">{campus.name}</div>
          <div className="text-xs text-slate-600">{campus.address}</div>
          {onSelect && (
            <button
              onClick={() => onSelect(campus)}
              className="mt-1 px-3 py-1 bg-primary text-white rounded-md text-xs font-semibold">
              Jadikan Tujuan
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
