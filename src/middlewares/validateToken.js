import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  const token = req.cookies.token;

  // If no token, deny authorization
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify the token
  jwt.verify(token, TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    req.user = user; // Store user data in request object
    next(); // Continue to the next middleware or route handler
  });
};
