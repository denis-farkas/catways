import * as reservationService from "../services/reservationService.js";
import Catway from "../models/Catway.js";

export const createReservation = async (req, res) => {
  try {
    const { clientName, boatName, startDate, endDate } = req.body;
    const catwayNumber = req.params.catwayNumber;
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });

    // Contrôle de chevauchement
    const overlap = await reservationService.findOverlap(
      catwayNumber,
      startDate,
      endDate
    );
    if (overlap) {
      return res
        .status(400)
        .json({ message: "Ce catway est déjà réservé sur cette période." });
    }

    const reservation = await reservationService.createReservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate,
    });
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReservations = async (req, res) => {
  try {
    const catwayNumber = req.params.catwayNumber;
    const reservations = await reservationService.getAllReservationsByCatway(
      catwayNumber
    );
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReservation = async (req, res) => {
  try {
    const { catwayNumber, reservationId } = req.params;
    const reservation = await reservationService.findReservationById(
      reservationId
    );
    if (!reservation || reservation.catwayNumber !== catwayNumber)
      return res.status(404).json({ message: "Réservation non trouvée." });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { catwayNumber, reservationId } = req.params;
    const { clientName, boatName, startDate, endDate } = req.body;
    const reservation = await reservationService.findReservationById(
      reservationId
    );
    if (!reservation || reservation.catwayNumber !== catwayNumber)
      return res.status(404).json({ message: "Réservation non trouvée." });

    // Contrôle de chevauchement (hors soi-même)
    if (startDate && endDate) {
      const overlap = await reservationService.findOverlap(
        catwayNumber,
        startDate,
        endDate,
        reservationId
      );
      if (overlap) {
        return res
          .status(400)
          .json({ message: "Ce catway est déjà réservé sur cette période." });
      }
    }

    const updated = await reservationService.updateReservation(reservationId, {
      clientName,
      boatName,
      startDate,
      endDate,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { catwayNumber, reservationId } = req.params;
    const reservation = await reservationService.findReservationById(
      reservationId
    );
    if (!reservation || reservation.catwayNumber !== catwayNumber)
      return res.status(404).json({ message: "Réservation non trouvée." });
    await reservationService.deleteReservation(reservationId);
    res.json({ message: "Réservation supprimée." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
