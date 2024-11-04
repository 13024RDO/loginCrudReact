import User from "../models/model.user.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js"; // Asegúrate de que esta función esté bien definida e importada

export const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: passwordHash,
      username,
    });

    const userSaved = await newUser.save();

    // Crear el token de acceso
    const generatedToken = await createAccessToken({ id: userSaved._id });

    // Establecer la cookie con el token generado
    res.cookie("token", generatedToken, { httpOnly: true, secure: true }); // Configura opciones según tu entorno

    // Enviar la respuesta JSON con la información del usuario
    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = (req, res) => {
  res.send("login");
};
