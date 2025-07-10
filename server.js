import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import catwayRoutes from "./routes/catwayRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { verifyToken } from "./controllers/userController.js";

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/catways")
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error(err));

// Middleware pour exclure /users/login et /users (création)
app.use((req, res, next) => {
  if (
    (req.path === "/users/login" && req.method === "POST") ||
    (req.path === "/users" && req.method === "POST")
  ) {
    return next();
  }
  verifyToken(req, res, next);
});

// Routes
app.use("/users", userRoutes);
app.use("/catways", catwayRoutes);

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

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
