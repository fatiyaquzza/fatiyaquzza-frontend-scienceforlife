import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User Pages
import Dashboard from "./pages/Dashboard";
import ModuleDetail from "./pages/ModuleDetail";
import Pretest from "./pages/Pretest";
import Material from "./pages/Material";
import Postest from "./pages/Postest";
import Result from "./pages/Result";

// Admin Layout & Pages
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModuleManagement from "./pages/admin/ModuleManagement";
import SubModuleManagement from "./pages/admin/SubModuleManagement";
import MaterialManagement from "./pages/admin/MaterialManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import UserManagement from "./pages/admin/UserManagement";

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
              {/* ===== PUBLIC ===== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* ===== USER ===== */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/module/:id"
                element={
                  <ProtectedRoute>
                    <ModuleDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pretest/:id"
                element={
                  <ProtectedRoute>
                    <Pretest />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/material/:id"
                element={
                  <ProtectedRoute>
                    <Material />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/postest/:id"
                element={
                  <ProtectedRoute>
                    <Postest />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/result/:id"
                element={
                  <ProtectedRoute>
                    <Result />
                  </ProtectedRoute>
                }
              />

              {/* ===== ADMIN ===== */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                {/* INI YANG PENTING */}
                <Route index element={<AdminDashboard />} />

                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="modules" element={<ModuleManagement />} />
                <Route path="submodules" element={<SubModuleManagement />} />
                <Route path="materials" element={<MaterialManagement />} />
                <Route path="questions" element={<QuestionManagement />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
        </Routes>
      </main>
      {isLandingPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
