import * as catwayService from "../services/catwayService.js";

export const createCatway = async (req, res) => {
  try {
    const { catwayNumber, type, catwayState } = req.body;
    const existing = await catwayService.findCatwayByNumber(catwayNumber);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Numéro de catway déjà utilisé." });
    }
    const catway = await catwayService.createCatway({
      catwayNumber,
      type,
      catwayState,
    });
    res.status(201).json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCatways = async (req, res) => {
  try {
    const catways = await catwayService.getAllCatways();
    res.json(catways);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCatway = async (req, res) => {
  try {
    const catway = await catwayService.findCatwayById(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    res.json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCatway = async (req, res) => {
  try {
    const { catwayNumber, type, catwayState } = req.body;
    const catway = await catwayService.updateCatway(req.params.id, {
      catwayNumber,
      type,
      catwayState,
    });
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    res.json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCatway = async (req, res) => {
  try {
    const catway = await catwayService.deleteCatway(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    res.json({ message: "Catway supprimé." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
