import { Router } from "express";
import {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
} from "../controllers/reservationController.js";

const router = Router({ mergeParams: true });

router.post("/", createReservation);
router.get("/", getReservations);
router.get("/:reservationId", getReservation);
router.put("/:reservationId", updateReservation);
router.delete("/:reservationId", deleteReservation);

export default router;
