import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function CatwaysList() {
  const [catways, setCatways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [catwayToDelete, setCatwayToDelete] = useState(null);

  const fetchCatways = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCatways(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des catways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatways();
  }, []);

  const handleDelete = (catway) => {
    setCatwayToDelete(catway);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!catwayToDelete) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways/${
          catwayToDelete._id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowModal(false);
      setCatwayToDelete(null);
      fetchCatways();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Catways</h2>
        <Link to="create" className="btn btn-primary">
          Créer un catway
        </Link>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Type</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {catways.map((catway) => (
            <tr key={catway._id}>
              <td>{catway.catwayNumber}</td>
              <td>{catway.catwayType}</td>
              <td>{catway.catwayState}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => navigate(`${catway._id}`)}
                >
                  Voir
                </button>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => navigate(`${catway._id}/edit`)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(catway)}
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
                  Voulez-vous vraiment supprimer le catway{" "}
                  <strong>{catwayToDelete?.catwayNumber}</strong> ?
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

function CatwayForm() {
  const { catwayId } = useParams();
  const isEdit = !!catwayId;
  const [catwayNumber, setCatwayNumber] = useState("");
  const [catwayType, setCatwayType] = useState("");
  const [catwayState, setCatwayState] = useState("");
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
          }/catways/${catwayId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          setCatwayNumber(res.data.catwayNumber);
          setCatwayType(res.data.catwayType);
          setCatwayState(res.data.catwayState);
        })
        .catch(() => setError("Erreur lors du chargement du catway"))
        .finally(() => setLoading(false));
    }
  }, [isEdit, catwayId]);

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
          }/catways/${catwayId}`,
          {
            catwayNumber,
            catwayType,
            catwayState,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways`,
          {
            catwayNumber,
            catwayType,
            catwayState,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      navigate("/catways");
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
      <h2>{isEdit ? "Modifier" : "Créer"} un catway</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Numéro</label>
          <input
            type="text"
            className="form-control"
            value={catwayNumber}
            onChange={(e) => setCatwayNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Type</label>
          <input
            type="text"
            className="form-control"
            value={catwayType}
            onChange={(e) => setCatwayType(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">État</label>
          <input
            type="text"
            className="form-control"
            value={catwayState}
            onChange={(e) => setCatwayState(e.target.value)}
            required
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

function CatwayDetail() {
  const { catwayId } = useParams();
  const [catway, setCatway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCatway = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/catways/${catwayId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCatway(res.data);
      } catch (err) {
        setError("Erreur lors du chargement du catway");
      } finally {
        setLoading(false);
      }
    };
    fetchCatway();
  }, [catwayId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!catway) return <div>Catway introuvable</div>;

  return (
    <div className="card p-4">
      <h2>Détail catway</h2>
      <p>
        <strong>ID :</strong> {catway._id}
      </p>
      <p>
        <strong>Numéro :</strong> {catway.catwayNumber}
      </p>
      <p>
        <strong>Type :</strong> {catway.catwayType}
      </p>
      <p>
        <strong>État :</strong> {catway.catwayState}
      </p>
      <Link to="../" className="btn btn-secondary">
        Retour
      </Link>
    </div>
  );
}

export default function Catways() {
  return (
    <div className="container mt-4">
      <Routes>
        <Route index element={<CatwaysList />} />
        <Route path="create" element={<CatwayForm />} />
        <Route path=":catwayId" element={<CatwayDetail />} />
        <Route path=":catwayId/edit" element={<CatwayForm />} />
      </Routes>
    </div>
  );
}
