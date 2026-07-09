import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    // Utilisateur de démonstration
    if (email === "admin@safezone.fr" && password === "123456") {

        const token = jwt.sign(
            {
                id: 1,
                nom: "Administrateur",
                email
            },
            process.env.JWT_SECRET || "safezone2026",
            {
                expiresIn: "24h"
            }
        );

        return res.json({
            token,
            user: {
                id: 1,
                nom: "Administrateur",
                email
            }
        });

    }

    return res.status(401).json({
        message: "Email ou mot de passe incorrect"
    });

});

export default router;