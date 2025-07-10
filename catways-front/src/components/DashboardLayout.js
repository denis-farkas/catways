import React, { useContext } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) return <div>Chargement...</div>;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Menu latéral */}
        <nav className="col-md-2 d-none d-md-block bg-light sidebar vh-100">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Tableau de bord
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/catways">
                  Catways
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reservations">
                  Réservations
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/users">
                  Utilisateurs
                </Link>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="http://localhost:3000/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation API
                </a>
              </li>
              <li className="nav-item mt-3">
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              </li>
            </ul>
          </div>
        </nav>
        {/* Contenu principal */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Tableau de bord</h1>
            <div>
              <span className="me-3">{date}</span>
            </div>
          </div>
          <div className="mb-3">
            <strong>Utilisateur connecté :</strong> {user?.username || "..."}
            <br />
            <strong>Email :</strong> {user?.email || "..."}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
