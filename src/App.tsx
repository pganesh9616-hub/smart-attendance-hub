import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import AdminHome from "./pages/admin/AdminHome";
import MarkAttendance from "./pages/shared/MarkAttendance";
import AttendanceAnalysis from "./pages/shared/AttendanceAnalysis";
import Reports from "./pages/admin/Reports";
import AddStaff from "./pages/admin/AddStaff";
import DeleteStaff from "./pages/admin/DeleteStaff";
import SettingsPage from "./pages/shared/SettingsPage";
import EmployeeHome from "./pages/employee/EmployeeHome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'admin' | 'employee' }> = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  return <Layout>{children}</Layout>;
};

const LoginRoute: React.FC = () => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/" element={<LoginRoute />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>} />
              <Route path="/admin/attendance" element={<ProtectedRoute role="admin"><MarkAttendance /></ProtectedRoute>} />
              <Route path="/admin/analysis" element={<ProtectedRoute role="admin"><AttendanceAnalysis /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
              <Route path="/admin/add-staff" element={<ProtectedRoute role="admin"><AddStaff /></ProtectedRoute>} />
              <Route path="/admin/delete-staff" element={<ProtectedRoute role="admin"><DeleteStaff /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />
              {/* Employee Routes */}
              <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeHome /></ProtectedRoute>} />
              <Route path="/employee/attendance" element={<ProtectedRoute role="employee"><MarkAttendance /></ProtectedRoute>} />
              <Route path="/employee/analysis" element={<ProtectedRoute role="employee"><AttendanceAnalysis /></ProtectedRoute>} />
              <Route path="/employee/settings" element={<ProtectedRoute role="employee"><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
