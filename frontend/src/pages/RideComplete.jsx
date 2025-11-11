import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, DollarSign } from "lucide-react";

const RideComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { duration, fare } = location.state || {};

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(" ");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="text-success" size={32} />
              </div>
            </div>
            <CardTitle className="text-center">Ride Completed</CardTitle>
            <p className="text-center text-muted-foreground">
              Thanks for riding with us!
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="text-primary" size={20} />
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                </div>
                <span className="font-bold text-foreground">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-primary" size={24} />
                  <span className="font-medium text-foreground">
                    Amount Payable
                  </span>
                </div>
                <span className="text-2xl font-bold text-primary">₹{fare}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" size="lg" onClick={() => navigate("/home")}>
                Back to Home
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/activities")}
              >
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RideComplete;
