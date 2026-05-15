import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

/** Smoothly fit bounds whenever the active route or origin changes. */
function SmoothFitBounds({ points, animateKey }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.flyToBounds(b, { padding: [50, 50], duration: 0.8, easeLinearity: 0.25 });
  }, [animateKey, map]); // eslint-disable-line
  return null;
}

/** Capture map clicks to pick origin (only when pickMode is on). */
function ClickToPick({ enabled, onPick }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function BinusMap({
  campuses = [],
  selectedRoute,
  hoveredRoute,
  allRoutes = [],
  origin,
  onOriginChange,
  onSelectCampus,
  mini = false,
  route, // for mini map context
}) {
  const [showCampuses, setShowCampuses] = useState(true);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [pickMode, setPickMode] = useState(false);

  const activeRoute = route || hoveredRoute || selectedRoute;
  const waypoints = activeRoute?.waypoints || [];

  const fitPoints = useMemo(() => {
    const pts = [...waypoints];
    if (origin) pts.push(origin);
    return pts;
  }, [waypoints, origin]);

  // Animate-key used by SmoothFitBounds: change → re-fit smoothly.
  const animateKey = useMemo(
    () => `${activeRoute?._id || 'none'}::${origin ? `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}` : ''}`,
    [activeRoute, origin]
  );

  // Bounds used by "Kembali ke Rute" reset button.
  const resetBoundsRef = useRef(null);
  useEffect(() => {
    if (fitPoints.length >= 2) {
      resetBoundsRef.current = L.latLngBounds(fitPoints.map((p) => [p.lat, p.lng]));
    } else {
      resetBoundsRef.current = null;
    }
  }, [fitPoints]);

  return (
    <MapContainer
      center={JAKARTA}
      zoom={11}
      scrollWheelZoom
      zoomControl={false}
      className={`h-full w-full ${pickMode ? 'cursor-crosshair' : ''}`}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickToPick enabled={pickMode && !mini} onPick={(o) => { onOriginChange?.(o); setPickMode(false); }} />

      {/* Background layer: ALL transit lines (faded) when toggle on */}
      {!mini && showAllRoutes && allRoutes.map((r) => (
        r._id !== activeRoute?._id && r.waypoints?.length >= 2 ? (
          <RoutePolyline key={r._id} waypoints={r.waypoints} faded />
        ) : null
      ))}

      {!mini && showCampuses && campuses.map((c) => (
        <CampusMarker key={c._id} campus={c} onSelect={onSelectCampus} />
      ))}

      {/* Active route on top */}
      {activeRoute && (
        <>
          <RoutePolyline waypoints={waypoints} highlighted />
          {waypoints.map((wp, i) => <StopMarker key={i} wp={wp} />)}
        </>
      )}

      {/* Smooth animation when activeRoute or origin changes */}
      <SmoothFitBounds points={fitPoints} animateKey={animateKey} />

      {origin && (
        <Marker
          position={[origin.lat, origin.lng]}
          icon={originIcon}
          draggable={!mini && !!onOriginChange}
          eventHandlers={{
            dragend(e) {
              const { lat, lng } = e.target.getLatLng();
              onOriginChange?.({ lat, lng });
            },
          }}
        />
      )}

      {!mini && (
        <MapControls
          getResetBounds={() => resetBoundsRef.current}
          onToggleCampuses={() => setShowCampuses((v) => !v)}
          showCampuses={showCampuses}
          onToggleAllRoutes={() => setShowAllRoutes((v) => !v)}
          showAllRoutes={showAllRoutes}
          onTogglePickMode={() => setPickMode((v) => !v)}
          pickMode={pickMode}
          canReset={!!resetBoundsRef.current}
        />
      )}
    </MapContainer>
  );
}
