import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import CampusMarker from './CampusMarker.jsx';
import RoutePolyline from './RoutePolyline.jsx';
import StopMarker from './StopMarker.jsx';
import MapControls from './MapControls.jsx';

const JAKARTA = [-6.2088, 106.8456];

const originIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="pulse-pin"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(b, { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export default function BinusMap({
  campuses = [],
  selectedRoute,
  hoveredRoute,
  origin,
  onSelectCampus,
  mini = false,
  route, // for mini map
}) {
  const [showCampuses, setShowCampuses] = useState(true);

  const activeRoute = route || hoveredRoute || selectedRoute;
  const waypoints = activeRoute?.waypoints || [];

  const fitPoints = useMemo(() => {
    const pts = [...waypoints];
    if (origin) pts.push(origin);
    return pts;
  }, [waypoints, origin]);

  return (
    <MapContainer
      center={JAKARTA}
      zoom={11}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {!mini && showCampuses && campuses.map((c) => (
        <CampusMarker key={c._id} campus={c} onSelect={onSelectCampus} />
      ))}

      {activeRoute && (
        <>
          <RoutePolyline waypoints={waypoints} highlighted />
          {waypoints.map((wp, i) => <StopMarker key={i} wp={wp} />)}
          <FitBounds points={fitPoints} />
        </>
      )}

      {origin && <Marker position={[origin.lat, origin.lng]} icon={originIcon} />}

      {!mini && (
        <MapControls
          onReset={() => {/* fit triggered by activeRoute change */}}
          onToggleCampuses={() => setShowCampuses((v) => !v)}
          showCampuses={showCampuses}
        />
      )}
    </MapContainer>
  );
}
