import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Lock, Mail, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  // States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Force light mode with subtle blue-gray background
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", "210 40% 96%");
    root.style.setProperty("--foreground", "222 47% 10%");
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", "222 47% 10%");
    return () => root.removeAttribute("style");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.post("/api/token/", {
        username: loginUsername,
        password: loginPassword,
      });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      const decoded = jwtDecode(res.data.access);
      localStorage.setItem("is_staff", decoded.is_staff);
      toast.success("Login successful!");
      navigate(decoded.is_staff ? "/dashboard" : "/home");
    } catch (error) {
      setLoginError(error.response?.data?.detail || "Invalid credentials");
      toast.error("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    if (registerPassword !== confirmPassword) {
      setRegisterError("Passwords do not match!");
      return;
    }
    try {
      await api.post("/api/user/register/", {
        username: registerUsername,
        password: registerPassword,
      });
      toast.success("Registration successful! Please login.");
      setActiveTab("login");
    } catch (error) {
      setRegisterError(error.response?.data?.detail || "Error during registration.");
      toast.error("Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-6 py-10">
      <Card
        className="
          w-full max-w-lg p-10 bg-white rounded-3xl border border-blue-100 
          shadow-[0_8px_40px_rgba(59,130,246,0.15)] animate-fade-in-scale
        "
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-3">
            <Bike className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
            SmartBI
          </h1>
          <p className="text-gray-600 text-sm">Intelligent Bike Sharing System</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-blue-50 rounded-lg text-base mb-6">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md font-medium"
            >
              Register
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-red-600 text-sm font-medium">{loginError}</p>
              )}

              <Button
                type="submit"
                className="w-full text-white font-semibold text-base py-2.5 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </form>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-gray-700 font-medium">
                  Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Create a username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {registerError && (
                <p className="text-red-600 text-sm font-medium">{registerError}</p>
              )}

              <Button
                type="submit"
                className="w-full text-white font-semibold text-base py-2.5 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
