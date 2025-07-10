import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import catwayRoutes from "./routes/catwayRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { verifyToken } from "./controllers/userController.js";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import * as userService from "./services/userService.js";
import bcrypt from "bcryptjs";
import { requireAuth } from "./middlewares/authMiddleware.js";
import User from "./models/User.js";
import flash from "connect-flash";
import * as catwayService from "./services/catwayService.js";
import * as reservationService from "./services/reservationService.js";

// Pour __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/catways")
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error(err));

// Autoriser le front React
app.use(cors({ origin: "http://localhost:3001", credentials: true }));

// Middleware pour exclure /users/login, /users (création) et /api-docs
app.use((req, res, next) => {
  if (
    (req.path === "/users/login" && req.method === "POST") ||
    (req.path === "/users" && req.method === "POST") ||
    req.path.startsWith("/api-docs")
  ) {
    return next();
  }
  verifyToken(req, res, next);
});

// Routes
app.use("/users", userRoutes);
app.use("/catways", catwayRoutes);

// Routes EJS protégées
app.get("/dashboard", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  res.render("dashboard", { user });
});
app.get("/users", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const users = await userService.getAllUsers();
  res.render("users", { user, users });
});
app.get("/catways", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const catways = await catwayService.getAllCatways();
  res.render("catways", { user, catways });
});
app.get("/reservations", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const catways = await catwayService.getAllCatways();
  let reservations = [];
  for (const catway of catways) {
    const resvs = await reservationService.getAllReservationsByCatway(
      catway.catwayNumber
    );
    reservations = reservations.concat(
      resvs.map((r) => ({ ...r.toObject(), catwayNumber: catway.catwayNumber }))
    );
  }
  res.render("reservations", { user, catways, reservations });
});

// Route GET /login (affiche le formulaire)
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Route POST /login (traite la connexion)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user) {
    return res.render("login", { error: "Email ou mot de passe incorrect." });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { error: "Email ou mot de passe incorrect." });
  }
  req.session.userId = user._id;
  res.redirect("/dashboard");
});

// Route POST /users (créer un nouvel utilisateur)
app.post("/users", requireAuth, async (req, res) => {
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
});

// Route POST /users/:id/delete (supprimer un utilisateur)
app.post("/users/:id/delete", requireAuth, async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    req.flash("success", "Utilisateur supprimé.");
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/users");
  }
});

// Route GET /logout (déconnexion)
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Swagger config
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Catways API",
      version: "1.0.0",
      description: "API de gestion des catways, utilisateurs et réservations",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Configuration de la session
app.use(
  session({
    secret: "votre_secret_session", // À remplacer par une vraie clé secrète en prod
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8h
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // Pour POST formulaire

app.get("/users/:id/edit", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const userToEdit = await userService.findUserById(req.params.id);
  const users = await userService.getAllUsers();
  res.render("users", { user, users, userToEdit });
});

app.post("/users/:id/edit", requireAuth, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await userService.updateUser(req.params.id, { username, email, password });
    req.flash("success", "Utilisateur modifié avec succès.");
    res.redirect("/users");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la modification.");
    res.redirect("/users");
  }
});

app.post("/catways", requireAuth, async (req, res) => {
  const { catwayNumber, type, catwayState } = req.body;
  try {
    if (!catwayNumber || !type || !catwayState) {
      req.flash("error", "Tous les champs sont obligatoires.");
      return res.redirect("/catways");
    }
    const existing = await catwayService.findCatwayByNumber(catwayNumber);
    if (existing) {
      req.flash("error", "Numéro de catway déjà utilisé.");
      return res.redirect("/catways");
    }
    await catwayService.createCatway({ catwayNumber, type, catwayState });
    req.flash("success", "Catway créé avec succès.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la création.");
    res.redirect("/catways");
  }
});

app.post("/catways/:id/delete", requireAuth, async (req, res) => {
  try {
    await catwayService.deleteCatway(req.params.id);
    req.flash("success", "Catway supprimé.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/catways");
  }
});

app.get("/catways/:id/edit", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const catwayToEdit = await catwayService.findCatwayById(req.params.id);
  const catways = await catwayService.getAllCatways();
  res.render("catways", { user, catways, catwayToEdit });
});

app.post("/catways/:id/edit", requireAuth, async (req, res) => {
  const { catwayNumber, type, catwayState } = req.body;
  try {
    await catwayService.updateCatway(req.params.id, {
      catwayNumber,
      type,
      catwayState,
    });
    req.flash("success", "Catway modifié avec succès.");
    res.redirect("/catways");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la modification.");
    res.redirect("/catways");
  }
});

app.post("/reservations", requireAuth, async (req, res) => {
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
});

app.post("/reservations/:id/delete", requireAuth, async (req, res) => {
  try {
    await reservationService.deleteReservation(req.params.id);
    req.flash("success", "Réservation supprimée.");
    res.redirect("/reservations");
  } catch (err) {
    req.flash("error", err.message || "Erreur lors de la suppression.");
    res.redirect("/reservations");
  }
});

app.get("/reservations/:id/edit", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId).lean();
  const catways = await catwayService.getAllCatways();
  let reservations = [];
  for (const catway of catways) {
    const resvs = await reservationService.getAllReservationsByCatway(
      catway.catwayNumber
    );
    reservations = reservations.concat(
      resvs.map((r) => ({ ...r.toObject(), catwayNumber: catway.catwayNumber }))
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
});

app.post("/reservations/:id/edit", requireAuth, async (req, res) => {
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
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
