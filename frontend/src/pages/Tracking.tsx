import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";

// 🟢 Status color mapping
const statusColors: Record<string, string> = {
  available: "#16a34a", // green
  in_use: "#dc2626", // red
  offline: "#6b7280", // gray
  reserved: "#eab308", // yellow
};

// 🧭 Fix missing default icons
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// 📍 Custom marker icon by color
const getMarkerIcon = (color: string) =>
  new L.DivIcon({
    html: `
      <div style="color:${color};">
        <svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' fill='currentColor'>
          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/>
          <circle cx='12' cy='9' r='2.5'/>
        </svg>
      </div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

interface Bicycle {
  id: number;
  device_id: string;
  status: "available" | "in_use" | "offline" | "reserved";
  latitude: number;
  longitude: number;
  last_update: string;
}

// 🗺️ Fit map bounds to all markers smoothly
const FitAllMarkers = ({ bikes }: { bikes: Bicycle[] }) => {
  const map = useMap();

  useEffect(() => {
    if (bikes.length === 0) return;

    const bounds = L.latLngBounds(bikes.map((b) => [b.latitude, b.longitude]));
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 }); // smooth zoom
  }, [bikes, map]);

  return null;
};

export default function Tracking() {
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch all bicycles (auto-refresh every 10s)
  useEffect(() => {
    let interval: any;

    const fetchBicycles = async () => {
      try {
        const res = await api.get("/api/bicycles/");
        setBicycles(res.data || []);
      } catch (error) {
        console.error("Error fetching bicycles:", error);
        toast.error("Failed to load bicycle locations");
      } finally {
        setLoading(false);
      }
    };

    fetchBicycles();
    interval = setInterval(fetchBicycles, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const activeBikes = bicycles.filter(
    (b) => b.latitude !== null && b.longitude !== null
  );

  return (
    <div className="p-8 space-y-6 animate-fade-in relative">
      {/* Header with persistent legend on right */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Live Bicycle Tracking
          </h1>
          <p className="text-muted-foreground">
            View all bicycles pinned on the live map with auto-updates
          </p>
        </div>

        {/* Always-visible Color Legend */}
        <div className="bg-background/90 border border-border rounded-lg shadow-md p-4 space-y-2 text-sm w-[180px]">
          <p className="font-semibold text-foreground text-center">
            Status Legend
          </p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span className="text-muted-foreground text-xs">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span className="text-muted-foreground text-xs">In Use</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-muted-foreground text-xs">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            <span className="text-muted-foreground text-xs">Offline</span>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <Card className="relative p-2 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh] text-muted-foreground">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Loading Map...
          </div>
        ) : activeBikes.length === 0 ? (
          <div className="flex items-center justify-center h-[70vh] text-muted-foreground">
            No bicycles with location data available
          </div>
        ) : (
          <div className="relative h-[70vh] rounded-xl overflow-hidden border border-border shadow-sm">
            <MapContainer
              center={[12.91, 80.14]} // Default campus center
              zoom={15}
              style={{ width: "100%", height: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {activeBikes.map((bike) => (
                <Marker
                  key={bike.id}
                  position={[bike.latitude, bike.longitude]}
                  icon={getMarkerIcon(statusColors[bike.status] || "#6b7280")}
                >
                  <Popup>
                    <strong>{bike.device_id}</strong>
                    <br />
                    Status:{" "}
                    <span className="capitalize font-medium text-primary">
                      {bike.status.replace("_", " ")}
                    </span>
                    <br />
                    Lat: {bike.latitude.toFixed(4)}, Lon:{" "}
                    {bike.longitude.toFixed(4)}
                    <br />
                    <small className="text-muted-foreground">
                      Last Update:{" "}
                      {bike.last_update
                        ? new Date(bike.last_update).toLocaleString()
                        : "N/A"}
                    </small>
                  </Popup>
                </Marker>
              ))}

              {/* Smooth zoom-fit for all bikes */}
              <FitAllMarkers bikes={activeBikes} />
            </MapContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
