import jwt from "jsonwebtoken";

export default function auth(req, res, next) {

    const header = req.headers.authorization;

    if (!header) {

        return res.status(401).json({
            message: "Token manquant"
        });

    }

    const token = header.split(" ")[1];

    try {

        const user = jwt.verify(
            token,
            process.env.JWT_SECRET || "safezone2026"
        );

        req.user = user;

        next();

    } catch {

        return res.status(401).json({
            message: "Token invalide"
        });

    }

}