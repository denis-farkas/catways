import { Router } from "express";
import {
  createCatway,
  getCatways,
  getCatway,
  updateCatway,
  deleteCatway,
} from "../controllers/catwayController.js";
import reservationRoutes from "./reservationRoutes.js";

const router = Router();

router.post("/", createCatway);
router.get("/", getCatways);
router.get("/:id", getCatway);
router.put("/:id", updateCatway);
router.delete("/:id", deleteCatway);

// Sous-ressource réservations
router.use("/:catwayNumber/reservations", reservationRoutes);

export default router;
