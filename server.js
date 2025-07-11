import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import catwayRoutes from "./routes/catwayRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
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
import { renderDashboard } from "./controllers/dashboardController.js";
import {
  renderUsersPage,
  renderEditUserPage,
} from "./controllers/userPageController.js";
import {
  renderCatwaysPage,
  renderEditCatwayPage,
} from "./controllers/catwayPageController.js";
import {
  renderReservationsPage,
  renderEditReservationPage,
} from "./controllers/reservationPageController.js";
import {
  createUserEjs,
  deleteUserEjs,
  editUserEjs,
} from "./controllers/userPageController.js";
import {
  createCatwayEjs,
  deleteCatwayEjs,
  editCatwayEjs,
} from "./controllers/catwayPageController.js";
import {
  createReservationEjs,
  deleteReservationEjs,
  editReservationEjs,
} from "./controllers/reservationPageController.js";

// Pour __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour POST formulaire

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/catways")
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error(err));

// Configuration de la session (doit être AVANT le middleware de protection et les routes)
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

// Middleware pour exclure /login, /logout, /users/login (POST), /users (POST) et /api-docs
app.use((req, res, next) => {
  if (
    req.path === "/login" ||
    req.path === "/logout" ||
    (req.path === "/users/login" && req.method === "POST") ||
    (req.path === "/users" && req.method === "POST") ||
    req.path.startsWith("/api-docs")
  ) {
    return next();
  }
  requireAuth(req, res, next);
});

// ROUTES EJS (vues) AVANT les routes API REST
app.get("/dashboard", requireAuth, renderDashboard);
app.get("/users", requireAuth, renderUsersPage);
app.get("/users/:id/edit", requireAuth, renderEditUserPage);
app.get("/catways", requireAuth, renderCatwaysPage);
app.get("/catways/:id/edit", requireAuth, renderEditCatwayPage);
app.get("/reservations", requireAuth, renderReservationsPage);
app.get("/reservations/:id/edit", requireAuth, renderEditReservationPage);

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
app.post("/users", requireAuth, createUserEjs);
app.post("/users/:id/delete", requireAuth, deleteUserEjs);
app.post("/users/:id/edit", requireAuth, editUserEjs);

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.post("/catways", requireAuth, createCatwayEjs);
app.post("/catways/:id/delete", requireAuth, deleteCatwayEjs);
app.post("/catways/:id/edit", requireAuth, editCatwayEjs);

app.post("/reservations", requireAuth, createReservationEjs);
app.post("/reservations/:id/delete", requireAuth, deleteReservationEjs);
app.post("/reservations/:id/edit", requireAuth, editReservationEjs);

// Route GET / (accueil)
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// Servir les fichiers statiques (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// ROUTES API REST APRÈS les vues EJS
app.use("/users", userRoutes);
app.use("/catways", catwayRoutes);

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
