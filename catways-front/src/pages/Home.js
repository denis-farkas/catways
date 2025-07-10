import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${apiUrl}/users/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Bienvenue sur Catways</h1>
      <p>
        Application de gestion des catways, réservations et utilisateurs pour la
        capitainerie.
      </p>
      <form onSubmit={handleSubmit} className="mb-3" style={{ maxWidth: 400 }}>
        <h2>Connexion</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Se connecter
        </button>
      </form>
      <Link
        to={{ pathname: "http://localhost:3000/api-docs" }}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-link"
      >
        Documentation de l'API
      </Link>
    </div>
  );
}

export default Home;
