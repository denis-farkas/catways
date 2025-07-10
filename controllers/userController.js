import * as userService from "../services/userService.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (password.length < 5) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 5 caractères.",
      });
    }
    const existing = await userService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }
    const user = await userService.createUser({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await userService.updateUser(req.params.id, {
      username,
      email,
      password,
    });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json({ message: "Utilisateur supprimé." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }
    const bcrypt = await import("bcryptjs");
    const isMatch = await bcrypt.default.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }
    const token = jwt.sign(
      { userId: user._id },
      "votre_secret_jwt", // Remplacez par une vraie clé secrète dans .env
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
