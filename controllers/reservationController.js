import Reservation from "../models/Reservation.js";
import Catway from "../models/Catway.js";

export const createReservation = async (req, res) => {
  try {
    const { clientName, boatName, startDate, endDate } = req.body;
    const catwayNumber = req.params.catwayNumber;
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });

    // Contrôle de chevauchement
    const overlap = await Reservation.findOne({
      catwayNumber,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });
    if (overlap) {
      return res
        .status(400)
        .json({ message: "Ce catway est déjà réservé sur cette période." });
    }

    const reservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate,
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReservations = async (req, res) => {
  try {
    const catwayNumber = req.params.catwayNumber;
    const reservations = await Reservation.find({ catwayNumber });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReservation = async (req, res) => {
  try {
    const { catwayNumber, reservationId } = req.params;
    const reservation = await Reservation.findOne({
      _id: reservationId,
      catwayNumber,
    });
    if (!reservation)
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
    const reservation = await Reservation.findOne({
      _id: reservationId,
      catwayNumber,
    });
    if (!reservation)
      return res.status(404).json({ message: "Réservation non trouvée." });

    // Contrôle de chevauchement (hors soi-même)
    if (startDate && endDate) {
      const overlap = await Reservation.findOne({
        catwayNumber,
        _id: { $ne: reservationId },
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      });
      if (overlap) {
        return res
          .status(400)
          .json({ message: "Ce catway est déjà réservé sur cette période." });
      }
    }

    if (clientName) reservation.clientName = clientName;
    if (boatName) reservation.boatName = boatName;
    if (startDate) reservation.startDate = startDate;
    if (endDate) reservation.endDate = endDate;
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { catwayNumber, reservationId } = req.params;
    const reservation = await Reservation.findOneAndDelete({
      _id: reservationId,
      catwayNumber,
    });
    if (!reservation)
      return res.status(404).json({ message: "Réservation non trouvée." });
    res.json({ message: "Réservation supprimée." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
