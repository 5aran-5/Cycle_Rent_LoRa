import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js"; 
import Layout from "../components/Layout";
import RealMap from "../components/RealMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bike } from "lucide-react";

// Haversine distance (in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Home = () => {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      loadBikes(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        loadBikes({ latitude, longitude });
      },
      (err) => {
        console.warn("Location permission denied:", err);
        setError("Unable to get location. Showing unsorted bikes.");
        loadBikes(null);
      }
    );
  };

  const loadBikes = async (userLoc) => {
    try {
      const response = await api.get("/api/user/bicycles/");
      let bikesData = response.data || [];

      // Compute distance if user location is available
      if (userLoc) {
        bikesData = bikesData.map((bike) => ({
          ...bike,
          distance: haversineDistance(
            userLoc.latitude,
            userLoc.longitude,
            bike.latitude,
            bike.longitude
          ),
        }));

        // Sort by distance
        bikesData.sort((a, b) => a.distance - b.distance);
      }

      setBikes(bikesData);
    } catch (error) {
      console.error("Error loading bikes:", error);
      setError("Failed to load bikes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

const handleViewDetails = (bike) => {
  navigate(`/bike/${bike.id}`, { state: { bike } });
};

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Map Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Campus Map
          </h2>
          <RealMap userLocation={userLocation} bikes={bikes} onBikeSelect={setSelectedBike}/>

          {selectedBike && (
            <Card className="mt-4 border-primary shadow-md transition-all animate-slide-up">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground">
                      {selectedBike.device_id}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} />
                      Lat: {selectedBike.latitude.toFixed(3)}, Lon:{" "}
                      {selectedBike.longitude.toFixed(3)}
                    </p>
                    {selectedBike.distance && (
                      <p className="text-sm text-primary font-medium">
                        {selectedBike.distance.toFixed(2)} km away
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(selectedBike)}
                    >
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBike(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Available Bikes List */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Available Bikes ({bikes.length})
          </h2>

          {loading ? (
            <p className="text-muted-foreground animate-pulse">
              Loading bikes...
            </p>
          ) : error ? (
            <Card>
              <CardContent className="pt-6 text-center text-red-500">
                {error}
              </CardContent>
            </Card>
          ) : bikes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Bike className="mx-auto mb-2 opacity-50" size={40} />
                <p>No bikes available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 animate-fade-in">
              {bikes.map((bike) => (
                <Card
                  key={bike.id}
                  className="hover:border-primary hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-foreground">
                          {bike.device_id}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin size={14} />
                          Lat: {bike.latitude.toFixed(3)}, Lon:{" "}
                          {bike.longitude.toFixed(3)}
                        </p>
                        {bike.distance && (
                          <p className="text-sm text-primary font-medium">
                            {bike.distance.toFixed(2)} km away
                          </p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => handleViewDetails(bike)}>
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Home;
