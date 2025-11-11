import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api.js";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

const ActiveRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rental_id, bike, message, start_time } = location.state || {};

  const [elapsed, setElapsed] = useState(0); // in seconds
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (!rental_id) {
      navigate("/home");
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rental_id, navigate]);

  // Format time hh:mm:ss
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 💰 Fare calculation: ₹10 base + ₹0.2 every 2 seconds
  const calculateFare = () => {
    const extraBlocks = Math.floor(elapsed / 2); // every 2 seconds
    const fare = 10 + extraBlocks * 0.2;
    return fare.toFixed(2);
  };

  // Stop Ride Handler
  const handleStop = async () => {
    setLoading(true);

    try {
      // Call backend API to complete ride
      const response = await api.post("/api/user/rentals/", {
        action: "complete",
        rental_id: rental_id,
      });

      if (intervalRef.current) clearInterval(intervalRef.current);

      // Navigate to completion screen
      navigate("/ride-complete", {
        state: {
          duration: elapsed,
          fare: calculateFare(),
          bike,
          start_time,
        },
      });
    } catch (err) {
      console.error("Error completing ride:", err);
      alert(
        err.response?.data?.error ||
          "Failed to complete ride. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Active Ride</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className="bg-success/10 text-success border border-success/20 rounded-lg p-3 text-sm">
                {message}
              </div>
            )}

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Bike {bike?.device_id}
              </p>
              <div className="text-5xl font-bold text-primary mb-1 font-mono">
                {formatTime(elapsed)}
              </div>
              <p className="text-xs text-muted-foreground">Ride Duration</p>
            </div>

            {/* Fare Display */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="bg-secondary/50">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="text-primary" size={16} />
                    <p className="text-xs text-muted-foreground">
                      Current Fare
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{calculateFare()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fare Info */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Fare Calculation:</p>
              <p>₹10 base + ₹0.2 per 2 seconds</p>
              <p className="mt-1">Minimum fare: ₹10</p>
            </div>

            {/* Stop Ride Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleStop}
              disabled={loading}
            >
              {loading ? "Stopping..." : "Stop Ride"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActiveRide;
