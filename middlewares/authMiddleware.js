import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  console.log("--- requireAuth ---");
  console.log("Session:", req.session);
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect("/login");
}
