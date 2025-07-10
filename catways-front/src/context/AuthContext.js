import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.userId) {
        axios
          .get(`${apiUrl}/users/${decoded.userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setUser(res.data))
          .catch(() => setUser(null))
          .finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [apiUrl]);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = parseJwt(token);
    if (decoded && decoded.userId) {
      axios
        .get(`${apiUrl}/users/${decoded.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
