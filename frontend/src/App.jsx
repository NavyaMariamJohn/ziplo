import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Landing from "./pages/landing/Landing";
import Analytics from "./pages/dashboard/LinkAnalytics";
import ShortenPage from "./pages/links/ShortenPage";
import MyLinks from "./pages/dashboard/MyLinks";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Settings from "./pages/dashboard/Settings";
import AnalyticsOverview from "./pages/dashboard/AnalyticsOverview";
import UserManagement from "./pages/admin/UserManagement";

// 🔐 Auth check
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// 🔐 Admin check
const isAdmin = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.role === "admin";
  } catch {
    return false;
  }
};

// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// 🔒 Admin Route
const AdminRoute = ({ children }) => {
  return isAdmin() ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <BrowserRouter>
        <Routes>

          {/* 🌐 PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shorten" element={<ShortenPage />} />

          {/* 🔐 USER */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/links"
            element={
              <ProtectedRoute>
                <MyLinks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/link/:id"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics/:id"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 🔥 ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED: PROTECTED ADMIN USERS ROUTE */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* ❌ 404 */}
          <Route path="*" element={<h1>Page Not Found</h1>} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;