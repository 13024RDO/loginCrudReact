import User from "../models/model.user.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({
        message: ["The email is already in use"],
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    // Save the new user in the database
    const userSaved = await newUser.save();

    // Create access token
    const token = await createAccessToken({
      id: userSaved._id,
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "none", // Required for cross-site cookie usage
    });

    // Respond with the user data
    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login a user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create access token
    const generatedToken = await createAccessToken({ id: userFound._id });

    // Set the token as a cookie
    res.cookie("token", generatedToken, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "none", // Required for cross-site cookie usage
    });

    // Respond with the user data
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout a user
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    expires: new Date(0), // Expire immediately
    sameSite: "none",
  });
  return res.sendStatus(200);
};

// Get profile of the logged-in user
export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(400).json({ message: "User not found" });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};
