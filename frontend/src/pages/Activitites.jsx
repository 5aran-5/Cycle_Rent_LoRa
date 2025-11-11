import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bike } from "lucide-react";

const Activities = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch rental history
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get("/api/user/rentals/history/");
        if (Array.isArray(response.data)) {
          setRides(response.data);
        } else if (response.data?.message) {
          setRides([]); // handle "No rental history found"
        }
      } catch (error) {
        console.error("Error fetching rental history:", error);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  // Format datetime
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration in min/sec
  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6 animate-fade-in">
          My Ride History
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
            <Clock size={40} className="mb-3 opacity-50" />
            <p>Loading your rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Clock className="mx-auto mb-2 opacity-50" size={40} />
              <p>No rides found</p>
              <p className="text-sm mt-1">
                Start your first ride to see it appear here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {rides.map((ride) => (
              <Card
                key={ride.id}
                className="transition-transform duration-200 hover:scale-[1.01]"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Bike className="text-primary" size={20} />
                      <div>
                        <p className="font-bold text-foreground">
                          Bike {ride.bicycle?.device_id || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ride ID: {ride.id}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        ride.status === "ongoing" ? "default" : "secondary"
                      }
                    >
                      {ride.status.charAt(0).toUpperCase() +
                        ride.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Ride Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Time</p>
                      <p className="font-medium text-foreground">
                        {formatDate(ride.start_time)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">End Time</p>
                      <p className="font-medium text-foreground">
                        {formatDate(ride.end_time)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">
                        {formatDuration(ride.duration_minutes)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Activities;
