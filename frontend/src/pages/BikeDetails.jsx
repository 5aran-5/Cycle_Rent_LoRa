import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import api from "../api.js";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bike as BikeIcon } from "lucide-react";

const BikeDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bikeId } = useParams();

  const bike = location.state?.bike || {
    id: bikeId,
    device_id: `BIKE_${bikeId}`,
    location: "Unknown",
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanningState, setScanningState] = useState(null); // null | 'scanning' | 'confirmed'

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    setScanningState("scanning");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // mimic scanning delay

      console.log("🔄 Sending start ride request for:", bike.device_id);

      const response = await api.post("/api/user/rentals/", {
        action: "start",
        device_id: bike.device_id,
      });

      console.log("✅ Ride start response:", response.data);

      setScanningState("confirmed");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate("/active-ride", {
        state: {
          rental_id: response.data.rental_id,
          bike,
          message: response.data.message,
          start_time: response.data.start_time,
        },
      });
    } catch (err) {
      console.error("❌ Error starting ride:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to start ride. Please try again."
      );
      setScanningState(null);
    } finally {
      setLoading(false);
    }
  };

  // Animated loading overlay
  if (scanningState) {
    return (
      <Layout>
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <BikeIcon className="text-primary" size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-foreground">
                {scanningState === "scanning" ? "SCANNING ID" : "RIDE CONFIRMED"}
              </h2>
              <p className="text-muted-foreground">
                {scanningState === "scanning"
                  ? "Please wait..."
                  : "Starting your ride..."}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main confirm screen
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-display">Confirm Ride</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Bike Icon */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <BikeIcon className="text-primary" size={48} />
              </div>
            </div>

            {/* Bike Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <BikeIcon className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Bike ID</p>
                  <p className="font-bold text-foreground">{bike.device_id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <MapPin className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">
                    Lat: {bike.latitude?.toFixed(3) || "—"}, Lon:{" "}
                    {bike.longitude?.toFixed(3) || "—"}
                  </p>
                  {bike.distance !== undefined && (
                    <p className="text-sm text-primary font-medium mt-1">
                      {bike.distance.toFixed(2)} km away
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full font-display shadow-md hover:shadow-lg transition-shadow"
                size="lg"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Starting Ride..." : "Confirm Ride"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/home")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BikeDetails;



// import { useState } from "react";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import api from "../api.js";
// import Layout from "../components/Layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { MapPin, Bike as BikeIcon, Ruler } from "lucide-react"; // Added ruler icon for distance

// const BikeDetails = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { bikeId } = useParams();

//   // Get bike info from Home page navigation state
//   const bike = location.state?.bike || {
//     id: bikeId,
//     device_id: `BIKE_${bikeId}`,
//     location: "Unknown",
//   };

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [scanningState, setScanningState] = useState(null); // null, 'scanning', 'confirmed'

// const handleConfirm = async () => {
//   setError("");
//   setLoading(true);
//   setScanningState("scanning");

//   try {
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     console.log("Starting ride for:", bike.device_id); // Debug log

//     const response = await api.post("/api/user/rentals/", {
//       action: "start",
//       device_id: bike.device_id,
//     });

//     console.log("Ride start response:", response.data);

//     setScanningState("confirmed");
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     navigate("/active-ride", {
//       state: {
//         rental_id: response.data.rental_id,
//         bike,
//         message: response.data.message,
//         start_time: response.data.start_time,
//       },
//     });
//   } catch (err) {
//     console.error("Error starting ride:", err.response?.data || err.message);
//     setError(
//       err.response?.data?.error ||
//         err.response?.data?.message ||
//         "Failed to start ride. Please try again."
//     );
//     setScanningState(null);
//   } finally {
//     setLoading(false);
//   }
// };


// //   const handleConfirm = async () => {
// //     setError("");
// //     setLoading(true);
// //     setScanningState("scanning");

// //     try {
// //       // Simulate scanning delay
// //       await new Promise((resolve) => setTimeout(resolve, 2000));

// //       // API call to start ride
// //       const response = await api.post("/api/user/rentals/", {
// //         action: "start",
// //         device_id: bike.device_id,
// //       });

// //       setScanningState("confirmed");
// //       await new Promise((resolve) => setTimeout(resolve, 2000));

// //       navigate("/active-ride", {
// //         state: {
// //           rental_id: response.data.rental_id,
// //           bike,
// //           message: response.data.message,
// //           start_time: response.data.start_time,
// //         },
// //       });
// //     } catch (err) {
// //       console.error("Error starting ride:", err);
// //       setError(
// //         err.response?.data?.message || "Failed to start ride. Please try again."
// //       );
// //       setScanningState(null);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

//   // Loading overlay for scanning/confirmation animations
//   if (scanningState) {
//     return (
//       <Layout>
//         <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
//           <div className="text-center space-y-6 p-8">
//             <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
//               <BikeIcon className="text-primary" size={48} />
//             </div>
//             <div className="space-y-2">
//               <h2 className="text-3xl font-display font-bold text-foreground">
//                 {scanningState === "scanning"
//                   ? "SCANNING ID"
//                   : "RIDE CONFIRMED"}
//               </h2>
//               <p className="text-muted-foreground">
//                 {scanningState === "scanning"
//                   ? "Please wait..."
//                   : "Starting your ride..."}
//               </p>
//             </div>
//             <div className="flex justify-center gap-2">
//               <div
//                 className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                 style={{ animationDelay: "0ms" }}
//               ></div>
//               <div
//                 className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                 style={{ animationDelay: "150ms" }}
//               ></div>
//               <div
//                 className="w-2 h-2 bg-primary rounded-full animate-bounce"
//                 style={{ animationDelay: "300ms" }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="container mx-auto px-4 py-6">
//         <Card className="max-w-md mx-auto shadow-lg">
//           <CardHeader>
//             <CardTitle className="font-display">Confirm Ride</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {error && (
//               <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Bike Icon */}
//             <div className="flex items-center justify-center">
//               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
//                 <BikeIcon className="text-primary" size={48} />
//               </div>
//             </div>

//             {/* Details Section */}
//             <div className="space-y-4">
//               {/* Bike ID */}
//               <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
//                 <BikeIcon className="text-primary mt-1" size={20} />
//                 <div>
//                   <p className="text-sm text-muted-foreground">Bike ID</p>
//                   <p className="font-bold text-foreground">{bike.device_id}</p>
//                 </div>
//               </div>

//               {/* Location */}
//               <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
//                 <MapPin className="text-primary mt-1" size={20} />
//                 <div>
//                   <p className="text-sm text-muted-foreground">Location</p>
//                   <p className="font-medium text-foreground">
//                     Lat: {bike.latitude?.toFixed(3) || "—"}, Lon:{" "}
//                     {bike.longitude?.toFixed(3) || "—"}
//                   </p>
//                   {/* Distance display */}
//                   {bike.distance !== undefined && (
//                     <p className="text-sm text-primary font-medium mt-1">
//                       {bike.distance.toFixed(2)} km away
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="space-y-3">
//               <Button
//                 className="w-full font-display shadow-md hover:shadow-lg transition-shadow"
//                 size="lg"
//                 onClick={handleConfirm}
//                 disabled={loading}
//               >
//                 {loading ? "Starting Ride..." : "Confirm Ride"}
//               </Button>

//               <Button
//                 variant="outline"
//                 className="w-full"
//                 onClick={() => navigate("/home")}
//                 disabled={loading}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default BikeDetails;
