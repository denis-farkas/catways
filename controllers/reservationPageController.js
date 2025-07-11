import * as reservationService from "../services/reservationService.js";
import * as catwayService from "../services/catwayService.js";
import User from "../models/User.js";

export const renderReservationsPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const catways = await catwayService.getAllCatways();
    let reservations = [];
    for (const catway of catways) {
      const resvs = await reservationService.getAllReservationsByCatway(
        catway.catwayNumber
      );
      reservations = reservations.concat(
        resvs.map((r) => ({
          ...r.toObject(),
          catwayNumber: catway.catwayNumber,
        }))
      );
    }
    res.render("reservations", {
      user,
      catways,
      reservations,
      reservationToEdit: null,
    });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/dashboard");
  }
};

export const renderEditReservationPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const catways = await catwayService.getAllCatways();
    let reservations = [];
    for (const catway of catways) {
      const resvs = await reservationService.getAllReservationsByCatway(
        catway.catwayNumber
      );
      reservations = reservations.concat(
        resvs.map((r) => ({
          ...r.toObject(),
          catwayNumber: catway.catwayNumber,
        }))
      );
    }
    const reservationToEdit = await reservationService.findReservationById(
      req.params.id
    );
    res.render("reservations", {
      user,
      catways,
      reservations,
      reservationToEdit,
    });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/reservations");
  }
};

export const createReservationEjs = async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
  try {
    if (!catwayNumber || !clientName || !boatName || !startDate || !endDate) {
      req.flash("error", "Tous les champs sont obligatoires.");
      return res.redirect("/reservations");
    }
    if (new Date(startDate) > new Date(endDate)) {
      req.flash("error", "La date de début doit précéder la date de fin.");
      return res.redirect("/reservations");
    }
    const overlap = await reservationService.findOverlap(
      catwayNumber,
      startDate,
      endDate
    );
    if (overlap) {
      req.flash("error", "Chevauchement avec une réservation existante.");
      return res.redirect("/reservations");
    }
    await reservationService.createReservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate,
    });
    req.flash("success", "Réservation créée avec succès.");
    res.redirect("/reservations");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la création.");
    res.redirect("/reservations");
  }
};

export const deleteReservationEjs = async (req, res) => {
  try {
    await reservationService.deleteReservation(req.params.id);
    req.flash("success", "Réservation supprimée.");
    res.redirect("/reservations");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/reservations");
  }
};

export const editReservationEjs = async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
  try {
    if (!catwayNumber || !clientName || !boatName || !startDate || !endDate) {
      req.flash("error", "Tous les champs sont obligatoires.");
      return res.redirect(`/reservations/${req.params.id}/edit`);
    }
    if (new Date(startDate) > new Date(endDate)) {
      req.flash("error", "La date de début doit précéder la date de fin.");
      return res.redirect(`/reservations/${req.params.id}/edit`);
    }
    const overlap = await reservationService.findOverlap(
      catwayNumber,
      startDate,
      endDate,
      req.params.id
    );
    if (overlap) {
      req.flash("error", "Chevauchement avec une réservation existante.");
      return res.redirect(`/reservations/${req.params.id}/edit`);
    }
    await reservationService.updateReservation(req.params.id, {
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate,
    });
    req.flash("success", "Réservation modifiée avec succès.");
    res.redirect("/reservations");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la modification.");
    res.redirect(`/reservations/${req.params.id}/edit`);
  }
};
