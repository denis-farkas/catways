import User from "../models/User.js";

export const renderDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    res.render("dashboard", { user });
  } catch (err) {
    req.flash(
      "error",
      err.message || "Erreur lors de l'affichage du dashboard."
    );
    res.redirect("/login");
  }
};
