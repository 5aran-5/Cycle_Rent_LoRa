import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix for missing Leaflet marker icons in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const userIcon = new L.DivIcon({
  html: `
    <div style="color:#2563eb;">
      <svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' fill='currentColor'>
        <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/>
        <circle cx='12' cy='9' r='2.5'/>
      </svg>
    </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const bikeIcon = new L.DivIcon({
  html: `
    <div style="color:#dc2626;">
      <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='currentColor'>
        <circle cx='5' cy='17' r='3'/>
        <circle cx='19' cy='17' r='3'/>
        <path d='M5 14h4l2-3h4l2 3h2'/>
        <path d='M12 3v5'/>
      </svg>
    </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Fit map to show all points
const FitBounds = ({ userLocation, bikes }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation && bikes.length === 0) return;

    const points = [];

    if (userLocation)
      points.push([userLocation.latitude, userLocation.longitude]);
    bikes.forEach((b) => {
      if (b.latitude && b.longitude) points.push([b.latitude, b.longitude]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [userLocation, bikes, map]);

  return null;
};

const RealMap = ({ userLocation, bikes, onBikeSelect }) => {
  return (
    <div
      className="rounded-xl overflow-hidden border border-border shadow-sm"
      style={{ height: "35vh", minHeight: "220px" }}
    >
      <MapContainer
        center={[12.91, 80.14]} // default campus location
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <strong>You are here</strong>
              <br />
              Lat: {userLocation.latitude.toFixed(3)} <br />
              Lon: {userLocation.longitude.toFixed(3)}
            </Popup>
          </Marker>
        )}

        {/* Bike Markers (Red) */}
        {bikes.map((bike) => (
          <Marker
            key={bike.id}
            position={[bike.latitude, bike.longitude]}
            icon={bikeIcon}
            eventHandlers={{
              click: () => onBikeSelect(bike),
            }}
          >
            <Popup>
              <strong>{bike.device_id}</strong>
              <br />
              Lat: {bike.latitude.toFixed(3)}, Lon: {bike.longitude.toFixed(3)}
              <br />
              <button
                onClick={() => onBikeSelect(bike)}
                className="text-primary underline text-xs mt-1"
              >
                Select Bike
              </button>
            </Popup>
          </Marker>
        ))}

        <FitBounds userLocation={userLocation} bikes={bikes} />
      </MapContainer>
    </div>
  );
};

export default RealMap;
