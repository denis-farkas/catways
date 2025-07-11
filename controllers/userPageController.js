import * as userService from "../services/userService.js";
import User from "../models/User.js";

export const renderUsersPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const users = await userService.getAllUsers();
    res.render("users", { user, users, userToEdit: null });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/dashboard");
  }
};

export const renderEditUserPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const userToEdit = await userService.findUserById(req.params.id);
    const users = await userService.getAllUsers();
    res.render("users", { user, users, userToEdit });
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de l'affichage.");
    res.redirect("/users");
  }
};

export const createUserEjs = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      req.flash("error", "Tous les champs sont obligatoires.");
      return res.redirect("/users");
    }
    if (password.length < 5) {
      req.flash(
        "error",
        "Le mot de passe doit contenir au moins 5 caractères."
      );
      return res.redirect("/users");
    }
    const existing = await userService.findUserByEmail(email);
    if (existing) {
      req.flash("error", "Email déjà utilisé.");
      return res.redirect("/users");
    }
    await userService.createUser({ username, email, password });
    req.flash("success", "Utilisateur créé avec succès.");
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la création.");
    res.redirect("/users");
  }
};

export const deleteUserEjs = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    req.flash("success", "Utilisateur supprimé.");
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/users");
  }
};

export const editUserEjs = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await userService.updateUser(req.params.id, { username, email, password });
    req.flash("success", "Utilisateur modifié avec succès.");
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la modification.");
    res.redirect("/users");
  }
};
