import Catway from "../models/Catway.js";

export async function findCatwayById(id) {
  return Catway.findById(id);
}

export async function findCatwayByNumber(catwayNumber) {
  return Catway.findOne({ catwayNumber });
}

export async function getAllCatways() {
  return Catway.find();
}

export async function createCatway(data) {
  const catway = new Catway(data);
  return catway.save();
}

export async function updateCatway(id, data) {
  const catway = await Catway.findById(id);
  if (!catway) return null;
  if (data.catwayNumber) catway.catwayNumber = data.catwayNumber;
  if (data.type) catway.type = data.type;
  if (data.catwayState) catway.catwayState = data.catwayState;
  return catway.save();
}

export async function deleteCatway(id) {
  return Catway.findByIdAndDelete(id);
}
