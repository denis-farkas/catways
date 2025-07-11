import * as catwayService from "../services/catwayService.js";
import User from "../models/User.js";

export const renderCatwaysPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const catways = await catwayService.getAllCatways();
    res.render("catways", { user, catways, catwayToEdit: null });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/dashboard");
  }
};

export const renderEditCatwayPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const catwayToEdit = await catwayService.findCatwayById(req.params.id);
    const catways = await catwayService.getAllCatways();
    res.render("catways", { user, catways, catwayToEdit });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/catways");
  }
};

export const createCatwayEjs = async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  try {
    if (!catwayNumber || !catwayType || !catwayState) {
      req.flash("error", "Tous les champs sont obligatoires.");
      return res.redirect("/catways");
    }
    const existing = await catwayService.findCatwayByNumber(catwayNumber);
    if (existing) {
      req.flash("error", "Numéro de catway déjà utilisé.");
      return res.redirect("/catways");
    }
    await catwayService.createCatway({ catwayNumber, catwayType, catwayState });
    req.flash("success", "Catway créé avec succès.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la création.");
    res.redirect("/catways");
  }
};

export const deleteCatwayEjs = async (req, res) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    req.flash("success", "Catway supprimé.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/catways");
  }
};

export const editCatwayEjs = async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  try {
    await catwayService.updateCatway(req.params.id, {
      catwayNumber,
      catwayType,
      catwayState,
    });
    req.flash("success", "Catway modifié avec succès.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la modification.");
    res.redirect(`/catways/${req.params.id}/edit`);
  }
};
