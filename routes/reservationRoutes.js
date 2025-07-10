import { Router } from "express";
import {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
} from "../controllers/reservationController.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - catwayNumber
 *         - clientName
 *         - boatName
 *         - checkIn
 *         - checkOut
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré de la réservation
 *         catwayNumber:
 *           type: string
 *           description: Numéro du catway réservé
 *         clientName:
 *           type: string
 *           description: Nom du client
 *         boatName:
 *           type: string
 *           description: Nom du bateau
 *         checkIn:
 *           type: string
 *           format: date-time
 *           description: Date d'arrivée
 *         checkOut:
 *           type: string
 *           format: date-time
 *           description: Date de départ
 *       example:
 *         id: 60d0fe4f5311236168a109cc
 *         catwayNumber: "A01"
 *         clientName: "John Doe"
 *         boatName: "Sea Dream"
 *         checkIn: "2023-07-01T14:00:00.000Z"
 *         checkOut: "2023-07-05T10:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: API de gestion des réservations (sous-ressource des catways)
 */

/**
 * @swagger
 * /catways/{catwayNumber}/reservations:
 *   post:
 *     summary: Créer une nouvelle réservation pour un catway
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro du catway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catway non trouvé
 */
router.post("/", createReservation);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations:
 *   get:
 *     summary: Récupérer toutes les réservations d'un catway
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro du catway
 *     responses:
 *       200:
 *         description: Liste des réservations du catway
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Catway non trouvé
 */
router.get("/", getReservations);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{reservationId}:
 *   get:
 *     summary: Récupérer une réservation spécifique
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro du catway
 *       - in: path
 *         name: reservationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Réservation ou catway non trouvé
 */
router.get("/:reservationId", getReservation);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{reservationId}:
 *   put:
 *     summary: Mettre à jour une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro du catway
 *       - in: path
 *         name: reservationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Réservation mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Réservation ou catway non trouvé
 */
router.put("/:reservationId", updateReservation);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{reservationId}:
 *   delete:
 *     summary: Supprimer une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: Numéro du catway
 *       - in: path
 *         name: reservationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation supprimée
 *       404:
 *         description: Réservation ou catway non trouvé
 */
router.delete("/:reservationId", deleteReservation);

export default router;
