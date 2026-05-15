import { CircleMarker, Popup } from 'react-leaflet';

const COLORS = {
  walk: '#94a3b8',
  TransJakarta: '#F97316',
  KRL: '#3B82F6',
  LRT: '#8B5CF6',
  Mikrotrans: '#14B8A6',
  bus: '#F97316',
};

export default function StopMarker({ wp }) {
  const color = COLORS[wp.transitMode] || '#5B5FEF';
  return (
    <CircleMarker
      center={[wp.lat, wp.lng]}
      radius={6}
      pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}
    >
      <Popup>
        <div className="text-xs">
          <div className="font-bold">{wp.stopName}</div>
          {wp.transitMode && <div className="text-slate-500">{wp.transitMode}</div>}
        </div>
      </Popup>
    </CircleMarker>
  );
}
