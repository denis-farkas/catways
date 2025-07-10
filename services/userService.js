import User from "../models/User.js";
import bcrypt from "bcryptjs";

export async function findUserById(id) {
  return User.findById(id);
}

export async function findUserByEmail(email) {
  return User.findOne({ email });
}

export async function getAllUsers() {
  return User.find();
}

export async function createUser({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  return user.save();
}

export async function updateUser(id, data) {
  const user = await User.findById(id);
  if (!user) return null;
  if (data.email && data.email !== user.email) user.email = data.email;
  if (data.username) user.username = data.username;
  if (data.password) user.password = await bcrypt.hash(data.password, 10);
  return user.save();
}

export async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}
