import mongoose from "mongoose";

const catwaySchema = new mongoose.Schema({
  catwayNumber: { type: Number, required: true, unique: true },
  catwayType: { type: String, required: true },
  catwayState: { type: String, required: true },
});

export default mongoose.model("Catway", catwaySchema);
