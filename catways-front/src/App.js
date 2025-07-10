import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Import des pages (à créer)
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Catways from "./pages/Catways";
import Reservations from "./pages/Reservations";
import Users from "./pages/Users";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catways/*" element={<Catways />} />
            <Route path="/reservations/*" element={<Reservations />} />
            <Route path="/users/*" element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
