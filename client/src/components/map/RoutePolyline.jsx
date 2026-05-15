import { Polyline } from 'react-leaflet';

const MODE_COLORS = {
  walk: '#94a3b8',
  TransJakarta: '#F97316',
  KRL: '#3B82F6',
  LRT: '#8B5CF6',
  Mikrotrans: '#14B8A6',
  bus: '#F97316',
};

export default function RoutePolyline({ waypoints = [], highlighted }) {
  if (waypoints.length < 2) return null;
  const segments = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const mode = b.transitMode || 'walk';
    segments.push(
      <Polyline
        key={i}
        positions={[[a.lat, a.lng], [b.lat, b.lng]]}
        pathOptions={{
          color: MODE_COLORS[mode] || '#5B5FEF',
          weight: highlighted ? 7 : 5,
          opacity: highlighted ? 1 : 0.85,
          dashArray: mode === 'walk' ? '6 8' : undefined,
          lineCap: 'round',
        }}
      />
    );
  }
  return <>{segments}</>;
}
