import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";
import predictRouter from "./api_predict.js";
import authRoutes from "./auth.js"
import auth from "./middleware/auth.js";
// import modelRouter from "./model_training.js"; // Décommente si ce fichier existe

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------------
// Données des villes
// ----------------------------
const data = [
  { city: "Paris", lat: 48.8566, lng: 2.3522, risks: ["Pollution", "Criminalité"] },
  { city: "Lyon", lat: 45.7640, lng: 4.8357, risks: ["Inondation", "Pollution"] },
  { city: "Marseille", lat: 43.2965, lng: 5.3698, risks: ["Feux de forêt"] },
  { city: "Bordeaux", lat: 44.8378, lng: -0.5792, risks: ["Inondation"] },
  { city: "Lille", lat: 50.6292, lng: 3.0573, risks: ["Criminalité"] }
];

// ----------------------------
// Fonction de monitoring
// ----------------------------
function logEvent(entry) {
  const logPath = "./logs.json";

  const logs = fs.existsSync(logPath)
    ? JSON.parse(fs.readFileSync(logPath, "utf8"))
    : [];

  logs.push({
    ...entry,
    date: new Date().toISOString(),
  });

  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

// ----------------------------
// Route principale
// ----------------------------
app.get("/", (req, res) => {
  res.send("Backend Zones à Risques opérationnel !");
});

// ----------------------------
// Liste des villes
// ----------------------------
app.get("/api/cities", (req, res) => {
  res.json(data);
});

// ----------------------------
// Prédiction simple
// ----------------------------
app.post("/api/predict", auth, (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({
      error: "Le champ city est obligatoire.",
    });
  }

  const found = data.find(
    (d) => d.city.toLowerCase() === city.toLowerCase()
  );

  if (!found) {
    logEvent({
      type: "error",
      message: `Ville inconnue : ${city}`,
    });

    return res.status(404).json({
      error: "Ville non trouvée",
    });
  }

  const prediction = `Risques détectés à ${found.city} : ${found.risks.join(", ")}`;

  logEvent({
    type: "prediction",
    city: found.city,
    result: prediction,
  });

  res.json({
    prediction,
  });
});

// ----------------------------
// Consultation des logs
// ----------------------------
app.get("/api/logs", (req, res) => {

  const logPath = "./logs.json";

  if (!fs.existsSync(logPath)) {
    return res.json([]);
  }

  const logs = JSON.parse(fs.readFileSync(logPath, "utf8"));

  res.json(logs);
});

// ----------------------------
// API météo
// ----------------------------
app.get("/api/meteo/:city", async (req, res) => {

  const found = data.find(
    (d) => d.city.toLowerCase() === req.params.city.toLowerCase()
  );

  if (!found) {
    return res.status(404).json({
      error: "Ville inconnue",
    });
  }

  try {

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${found.lat}&longitude=${found.lng}&current_weather=true`;

    const response = await fetch(url);

    const meteo = await response.json();

    res.json({
      city: found.city,
      meteo: meteo.current_weather,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Impossible de récupérer la météo.",
    });

  }

});

// ----------------------------
// Routes IA
// ----------------------------
app.use("/api", predictRouter);
app.use("/api/auth", authRoutes);

// Si tu possèdes model_training.js
// app.use("/api/model", modelRouter);
app.get("/api/rapport", (req, res) => {
  res.json({
    titre: "Rapport National SafeZone France",
    dateGeneration: new Date().toLocaleString("fr-FR"),
    resume:
      "Ce rapport présente les principales zones à risque en France à partir des données enregistrées dans SafeZone.",

    typesRisques: [
      {
        couleur: "#e53935",
        nom: "Inondation",
        description: "Zones exposées aux crues.",
        zone: "Paris, Lyon",
        niveau: "Élevé",
      },
      {
        couleur: "#fb8c00",
        nom: "Incendie",
        description: "Zones sensibles aux feux de forêt.",
        zone: "Marseille",
        niveau: "Élevé",
      },
      {
        couleur: "#43a047",
        nom: "Pollution",
        description: "Pollution de l'air.",
        zone: "Lille",
        niveau: "Moyen",
      },
      {
        couleur: "#1e88e5",
        nom: "Tempête",
        description: "Vents violents.",
        zone: "Bretagne",
        niveau: "Moyen",
      },
      {
        couleur: "#8e24aa",
        nom: "Canicule",
        description: "Fortes chaleurs.",
        zone: "Toulouse",
        niveau: "Élevé",
      },
      {
        couleur: "#6d4c41",
        nom: "Avalanche",
        description: "Risque en montagne.",
        zone: "Alpes",
        niveau: "Élevé",
      }
    ],

    statistiques: [
      "Zones surveillées : 126",
      "Alertes actives : 17",
      "Départements concernés : 41"
    ],

    dernieresAlertes: [
      "Crue de la Seine",
      "Incendie dans les Landes",
      "Canicule en Occitanie"
    ]
  });
});

// ----------------------------
// Lancement serveur
// ----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
module.exports = app;