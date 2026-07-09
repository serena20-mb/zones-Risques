import express from "express";
import bcrypt from "bcrypt";
import { dbPool } from "./db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nom, email et mot de passe requis." });
  }

  try {
    const [existing] = await dbPool.execute("SELECT id FROM Users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await dbPool.execute(
      "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Compte créé !", user: { name, email } });
  } catch (err) {
    console.error("[Auth] Erreur register:", err.message);
    res.status(500).json({ error: "Erreur serveur lors de la création du compte." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await dbPool.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Identifiants incorrects"
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: "Identifiants incorrects"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || "safezone2026",
      {
        expiresIn: "24h"
      }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Erreur serveur."
    });

  }
});
export default router;