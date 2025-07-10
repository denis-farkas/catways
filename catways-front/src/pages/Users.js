import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/users/${
          userToDelete._id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Utilisateurs</h2>
        <Link to="create" className="btn btn-primary">
          Créer un utilisateur
        </Link>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => navigate(`${user._id}`)}
                >
                  Voir
                </button>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => navigate(`${user._id}/edit`)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(user)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modale de confirmation */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Voulez-vous vraiment supprimer l'utilisateur{" "}
                  <strong>{userToDelete?.username}</strong> ?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserForm() {
  const { userId } = useParams();
  const isEdit = !!userId;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      axios
        .get(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          setUsername(res.data.username);
          setEmail(res.data.email);
        })
        .catch(() => setError("Erreur lors du chargement de l'utilisateur"))
        .finally(() => setLoading(false));
    }
  }, [isEdit, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      if (isEdit) {
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/users/${userId}`,
          {
            username,
            email,
            password: password || undefined, // si vide, ne pas changer
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || process.env.API_URL}/users`,
          {
            username,
            email,
            password,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      navigate("/users");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h2>{isEdit ? "Modifier" : "Créer"} un utilisateur</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
          <label className="form-label">
            Mot de passe{" "}
            {isEdit && (
              <span className="text-muted">
                (laisser vide pour ne pas changer)
              </span>
            )}
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          {isEdit ? "Enregistrer" : "Créer"}
        </button>
        <Link to="../" className="btn btn-secondary ms-2">
          Annuler
        </Link>
      </form>
    </div>
  );
}

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
      } catch (err) {
        setError("Erreur lors du chargement de l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <div>Utilisateur introuvable</div>;

  return (
    <div className="card p-4">
      <h2>Détail utilisateur</h2>
      <p>
        <strong>ID :</strong> {user._id}
      </p>
      <p>
        <strong>Nom :</strong> {user.username}
      </p>
      <p>
        <strong>Email :</strong> {user.email}
      </p>
      <Link to="../" className="btn btn-secondary">
        Retour
      </Link>
    </div>
  );
}

export default function Users() {
  return (
    <div className="container mt-4">
      <Routes>
        <Route index element={<UsersList />} />
        <Route path="create" element={<UserForm />} />
        <Route path=":userId" element={<UserDetail />} />
        <Route path=":userId/edit" element={<UserForm />} />
      </Routes>
    </div>
  );
}
