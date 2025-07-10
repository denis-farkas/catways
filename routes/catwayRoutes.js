import { Router } from "express";
import {
  createCatway,
  getCatways,
  getCatway,
  updateCatway,
  deleteCatway,
} from "../controllers/catwayController.js";
import reservationRoutes from "./reservationRoutes.js";
// import { verifyToken } from "../controllers/userController.js"; // SUPPRIMÉ

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Catway:
 *       type: object
 *       required:
 *         - catwayNumber
 *         - type
 *         - catwayState
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-généré du catway
 *         catwayNumber:
 *           type: string
 *           description: Numéro du catway
 *         type:
 *           type: string
 *           description: Type du catway
 *         catwayState:
 *           type: string
 *           description: État du catway
 *       example:
 *         id: 60d0fe4f5311236168a109cb
 *         catwayNumber: "A01"
 *         type: "long"
 *         catwayState: "good"
 */

/**
 * @swagger
 * tags:
 *   name: Catways
 *   description: API de gestion des catways
 */

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Créer un nouveau catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Catway'
 *     responses:
 *       201:
 *         description: Catway créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       400:
 *         description: Erreur de validation
 */
router.post("/", createCatway);

/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Récupérer tous les catways
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catways
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Catway'
 */
router.get("/", getCatways);

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupérer un catway par ID
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du catway
 *     responses:
 *       200:
 *         description: Catway trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       404:
 *         description: Catway non trouvé
 */
router.get("/:id", getCatway);

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Mettre à jour un catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du catway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Catway'
 *     responses:
 *       200:
 *         description: Catway mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catway'
 *       404:
 *         description: Catway non trouvé
 */
router.put("/:id", updateCatway);

/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprimer un catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du catway
 *     responses:
 *       200:
 *         description: Catway supprimé
 *       404:
 *         description: Catway non trouvé
 */
router.delete("/:id", deleteCatway);

// Sous-ressource réservations
router.use("/:catwayNumber/reservations", reservationRoutes);

export default router;
