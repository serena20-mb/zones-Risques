import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const [risques] = await db.query(`
            SELECT
            nom,
            description,
            niveau,
            couleur,
            zone
            FROM risques
        `);

        const [alertes] = await db.query(`
            SELECT
            titre
            FROM alertes
            ORDER BY id DESC
            LIMIT 5
        `);

        const [[nbRisques]] = await db.query(`
            SELECT COUNT(*) total
            FROM risques
        `);

        const [[nbAlertes]] = await db.query(`
            SELECT COUNT(*) total
            FROM alertes
        `);

        res.json({

            titre:"Rapport National des Zones à Risque - France",

            dateGeneration:new Date().toLocaleString("fr-FR"),

            resume:
            "Ce rapport présente les principaux risques recensés sur le territoire français grâce aux données enregistrées dans la plateforme SafeZone France.",

            typesRisques:risques,

            statistiques:[

                "Nombre de risques : "+nbRisques.total,

                "Nombre d'alertes : "+nbAlertes.total,

                "Analyse réalisée par SafeZone IA"

            ],

            dernieresAlertes:alertes

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json(error);

    }

});

export default router;