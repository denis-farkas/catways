import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Catway from "./models/Catway.js";
import Reservation from "./models/Reservation.js";

dotenv.config();

const __dirname = path.resolve();

async function importData() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/catways",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connexion MongoDB réussie");

    // Import Catways
    const catwaysData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "catways.json"), "utf-8")
    );
    await Catway.deleteMany();
    await Catway.insertMany(catwaysData);
    console.log("Catways importés");

    // Import Reservations
    const reservationsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "reservations.json"), "utf-8")
    );
    await Reservation.deleteMany();
    await Reservation.insertMany(reservationsData);
    console.log("Réservations importées");

    process.exit();
  } catch (err) {
    console.error("Erreur lors de l'importation :", err);
    process.exit(1);
  }
}

importData();
