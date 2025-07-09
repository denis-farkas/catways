import Catway from "../models/Catway.js";

export const createCatway = async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const existing = await Catway.findOne({ catwayNumber });
    if (existing)
      return res
        .status(400)
        .json({ message: "Numéro de catway déjà utilisé." });
    const catway = new Catway({ catwayNumber, catwayType, catwayState });
    await catway.save();
    res.status(201).json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCatways = async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCatway = async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    res.json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCatway = async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    if (catwayNumber && catwayNumber !== catway.catwayNumber) {
      const existing = await Catway.findOne({ catwayNumber });
      if (existing)
        return res
          .status(400)
          .json({ message: "Numéro de catway déjà utilisé." });
      catway.catwayNumber = catwayNumber;
    }
    if (catwayType) catway.catwayType = catwayType;
    if (catwayState) catway.catwayState = catwayState;
    await catway.save();
    res.json(catway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCatway = async (req, res) => {
  try {
    const catway = await Catway.findByIdAndDelete(req.params.id);
    if (!catway) return res.status(404).json({ message: "Catway non trouvé." });
    res.json({ message: "Catway supprimé." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
