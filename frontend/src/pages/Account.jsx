import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Key, Calendar, LogOut } from "lucide-react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import api from "../api";

const Account = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/user/profile/");
        if (response.data?.username) {
          setUserInfo(response.data);
        } else {
          setUserInfo({
            username: "Unknown User",
            rfid_tag: null,
            registered_date: null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserInfo({
          username: "Unknown User",
          rfid_tag: null,
          registered_date: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Not Available";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Loading profile...</p>
        </div>
      </Layout>
    );

  if (!userInfo) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Account</h1>

        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="text-primary" size={36} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Info */}
            <div className="space-y-5">
              {/* Name */}
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <User className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">
                    {userInfo.username}
                  </p>
                </div>
              </div>

              {/* RFID */}
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <Key className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">RFID Tag</p>
                  <p
                    className={`font-medium ${
                      !userInfo.rfid_tag
                        ? "text-yellow-600 italic"
                        : "text-foreground"
                    }`}
                  >
                    {userInfo.rfid_tag
                      ? userInfo.rfid_tag
                      : "RFID yet to be assigned"}
                  </p>
                </div>
              </div>

              {/* Registered Date */}
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registered On
                  </p>
                  <p className="font-medium text-foreground">
                    {formatDate(userInfo.registered_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="destructive"
              className="w-full mt-6 shadow-md hover:shadow-lg"
              size="lg"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Account;
