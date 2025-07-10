import Reservation from "../models/Reservation.js";

export async function findReservationById(id) {
  return Reservation.findById(id);
}

export async function getAllReservationsByCatway(catwayNumber) {
  return Reservation.find({ catwayNumber });
}

export async function createReservation(data) {
  const reservation = new Reservation(data);
  return reservation.save();
}

export async function updateReservation(id, data) {
  const reservation = await Reservation.findById(id);
  if (!reservation) return null;
  if (data.clientName) reservation.clientName = data.clientName;
  if (data.boatName) reservation.boatName = data.boatName;
  if (data.startDate) reservation.startDate = data.startDate;
  if (data.endDate) reservation.endDate = data.endDate;
  return reservation.save();
}

export async function deleteReservation(id) {
  return Reservation.findByIdAndDelete(id);
}

export async function findOverlap(
  catwayNumber,
  startDate,
  endDate,
  excludeId = null
) {
  const query = {
    catwayNumber,
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Reservation.findOne(query);
}
