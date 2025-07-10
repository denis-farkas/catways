import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      // On récupère toutes les réservations de tous les catways (API à adapter si besoin)
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // On agrège toutes les réservations de chaque catway
      let allReservations = [];
      for (const catway of res.data) {
        const resv = await axios.get(
          `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways/${
            catway.catwayNumber
          }/reservations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        allReservations = allReservations.concat(
          resv.data.map((r) => ({ ...r, catwayNumber: catway.catwayNumber }))
        );
      }
      setReservations(allReservations);
    } catch (err) {
      setError("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleDelete = (reservation) => {
    setReservationToDelete(reservation);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL || process.env.API_URL}/catways/${
          reservationToDelete.catwayNumber
        }/reservations/${reservationToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowModal(false);
      setReservationToDelete(null);
      fetchReservations();
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Réservations</h2>
        <Link to="create" className="btn btn-primary">
          Créer une réservation
        </Link>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Catway</th>
            <th>Client</th>
            <th>Bateau</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res._id}>
              <td>{res.catwayNumber}</td>
              <td>{res.clientName}</td>
              <td>{res.boatName}</td>
              <td>{res.startDate?.slice(0, 10)}</td>
              <td>{res.endDate?.slice(0, 10)}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() =>
                    navigate(`${res._id}?catway=${res.catwayNumber}`)
                  }
                >
                  Voir
                </button>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() =>
                    navigate(`${res._id}/edit?catway=${res.catwayNumber}`)
                  }
                >
                  Modifier
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(res)}
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
                  Voulez-vous vraiment supprimer la réservation de{" "}
                  <strong>{reservationToDelete?.clientName}</strong> ?
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

function ReservationForm() {
  const { reservationId } = useParams();
  const isEdit = !!reservationId;
  const [catwayNumber, setCatwayNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [boatName, setBoatName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const params = new URLSearchParams(window.location.search);
      const catway = params.get("catway");
      axios
        .get(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/catways/${catway}/reservations/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          setCatwayNumber(catway);
          setClientName(res.data.clientName);
          setBoatName(res.data.boatName);
          setStartDate(res.data.startDate?.slice(0, 10));
          setEndDate(res.data.endDate?.slice(0, 10));
        })
        .catch(() => setError("Erreur lors du chargement de la réservation"))
        .finally(() => setLoading(false));
    }
  }, [isEdit, reservationId]);

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
          }/catways/${catwayNumber}/reservations/${reservationId}`,
          {
            clientName,
            boatName,
            startDate,
            endDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/catways/${catwayNumber}/reservations`,
          {
            clientName,
            boatName,
            startDate,
            endDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      navigate("/reservations");
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
      <h2>{isEdit ? "Modifier" : "Créer"} une réservation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Catway</label>
          <input
            type="text"
            className="form-control"
            value={catwayNumber}
            onChange={(e) => setCatwayNumber(e.target.value)}
            required={!isEdit}
            disabled={isEdit}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Client</label>
          <input
            type="text"
            className="form-control"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Bateau</label>
          <input
            type="text"
            className="form-control"
            value={boatName}
            onChange={(e) => setBoatName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Début</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Fin</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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

function ReservationDetail() {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams(window.location.search);
        const catway = params.get("catway");
        const res = await axios.get(
          `${
            process.env.REACT_APP_API_URL || process.env.API_URL
          }/catways/${catway}/reservations/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReservation({ ...res.data, catwayNumber: catway });
      } catch (err) {
        setError("Erreur lors du chargement de la réservation");
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [reservationId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!reservation) return <div>Réservation introuvable</div>;

  return (
    <div className="card p-4">
      <h2>Détail réservation</h2>
      <p>
        <strong>ID :</strong> {reservation._id}
      </p>
      <p>
        <strong>Catway :</strong> {reservation.catwayNumber}
      </p>
      <p>
        <strong>Client :</strong> {reservation.clientName}
      </p>
      <p>
        <strong>Bateau :</strong> {reservation.boatName}
      </p>
      <p>
        <strong>Début :</strong> {reservation.startDate?.slice(0, 10)}
      </p>
      <p>
        <strong>Fin :</strong> {reservation.endDate?.slice(0, 10)}
      </p>
      <Link to="../" className="btn btn-secondary">
        Retour
      </Link>
    </div>
  );
}

export default function Reservations() {
  return (
    <div className="container mt-4">
      <Routes>
        <Route index element={<ReservationsList />} />
        <Route path="create" element={<ReservationForm />} />
        <Route path=":reservationId" element={<ReservationDetail />} />
        <Route path=":reservationId/edit" element={<ReservationForm />} />
      </Routes>
    </div>
  );
}
