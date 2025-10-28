import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


// Admin pages
import DashboardLayout from "./pages/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Bicycles from "./pages/Bicycles.jsx";
// import Users from "./pages/Users.jsx";
// import Tracking from "./pages/Tracking.jsx";
// import Logs from "./pages/Logs.jsx";
// import Settings from "./pages/Settings.jsx";

const queryClient = new QueryClient();

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}


function Unauthorized() {
  return <h1>403 - Unauthorized Access</h1>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<RegisterAndLogout />} />

            {/* Protected normal user route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Admin-only dashboard routes */}
            <Route
              element={
                <ProtectedRoute requireAdmin={true}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bicycles" element={<Bicycles />} />
              {/* <Route path="/users" element={<Users />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} /> */}
            </Route>

            {/* Unauthorized + 404 */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
