
import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import path from "path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PREDICT_SCRIPT = path.join(__dirname, "scripts", "api_prediction.py");

// ⬇️ AJOUTE CES 2 LIGNES QUI MANQUAIENT
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
const FASTAPI_TIMEOUT = 5000;
const PYTHON_EXEC = process.platform === "win32" ? "python" : "python3";
const dbPool = mysql.createPool({
host:     process.env.DB_HOST,   
user:     process.env.DB_USER,    
password: process.env.DB_PASSWORD ,
database: process.env.DB_NAME,     
waitForConnections: true,
connectionLimit:    10,
});

const VILLES_VALIDES = ["Paris", "Lyon", "Marseille", "Bordeaux", "Lille",
"Nice", "Strasbourg", "Toulouse", "Nantes", "Montpellier",
];

const TYPES_INCIDENT = [
"inondation", "incendie", "criminalité",
"accident_route", "pollution", "glissement",
];

function validatePredictionInput(body) {
const errors = [];

if (!body.ville || !VILLES_VALIDES.includes(body.ville)) {
errors.push(`ville invalide. Valeurs acceptées : ${VILLES_VALIDES.join(", ")}`);
}
if (typeof body.latitude !== "number" || body.latitude < 41.0 || body.latitude > 51.5) {
  errors.push("latitude invalide (plage France métropolitaine : 41.0 – 51.5)");
}
if (typeof body.longitude !== "number" || body.longitude < -5.5 || body.longitude > 9.7) {
  errors.push("longitude invalide (plage France métropolitaine : -5.5 – 9.7)");
}
if (!body.type_incident || !TYPES_INCIDENT.includes(body.type_incident.toLowerCase())) {
errors.push(`type_incident invalide. Valeurs acceptées : ${TYPES_INCIDENT.join(", ")}`);
}
if (!Number.isInteger(body.gravite) || body.gravite < 1 || body.gravite > 5) {
errors.push("gravite doit être un entier entre 1 et 5");
}
if (typeof body.nb_signalements_30j !== "number" || body.nb_signalements_30j < 0) {
errors.push("nb_signalements_30j doit être un nombre positif");
}

return errors;
}

// ─── APPEL FASTAPI ────────────────────────────────────────────────────────────
async function callFastAPI(payload) {
const response = await axios.post(`${FASTAPI_URL}/predict`, payload, {
timeout: FASTAPI_TIMEOUT,
headers: { "Content-Type": "application/json" },
});
return response.data;
}

// ─── FALLBACK : appel Python direct si FastAPI hors ligne ───────────────────
function callPythonDirect(payload) {
return new Promise((resolve, reject) => {
const args   = [PREDICT_SCRIPT, JSON.stringify(payload)];
const proc   = spawn(PYTHON_EXEC, args, { cwd: __dirname });
let stdout = "";
let stderr = "";


proc.stdout.on("data", (d) => (stdout += d.toString()));
proc.stderr.on("data", (d) => (stderr += d.toString()));

proc.on("close", (code) => {
  if (code !== 0) {
    return reject(new Error(`Python exited ${code}: ${stderr}`));
  }
  try {
    // Le script Python doit afficher un JSON sur stdout
    const result = JSON.parse(stdout.trim().split("\n").pop());
    resolve(result);
  } catch {
    reject(new Error(`Réponse Python invalide : ${stdout}`));
  }
});

proc.on("error", (err) =>
  reject(new Error(`Impossible de lancer Python : ${err.message}`))
);


});
}

// ─── SAUVEGARDE DE LA PRÉDICTION EN BASE ────────────────────────────────────
async function savePredictionToDB(input, result, userId = null) {
try {
const conn = await dbPool.getConnection();
await conn.execute(
`INSERT INTO Signalements (description, type_incident, gravite, latitude, longitude, ville, date_signalement, utilisateur_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
[
`Prédiction IA : ${result.niveau_risque} (confiance ${result.confidence}%)`,
input.type_incident,
input.gravite,
input.latitude,
input.longitude,
input.ville,
userId || null,
]
);
conn.release();
} catch (err) {
// Ne pas bloquer la réponse si la sauvegarde échoue
console.warn("[Predict] Sauvegarde DB échouée :", err.message);
}
}

  router.post("/prediction", async (req, res) => {
  const body = req.body;

// Auto-complétion des champs temporels si absents
const now = new Date();
body.heure        = body.heure        ?? now.getHours();
body.jour_semaine = body.jour_semaine ?? now.getDay();
body.mois         = body.mois         ?? (now.getMonth() + 1);

// Validation
const errors = validatePredictionInput(body);
if (errors.length > 0) {
return res.status(400).json({
success: false,
errors,
exemple: {
ville: "Douala", latitude: 4.0511, longitude: 9.7679,
type_incident: "inondation", gravite: 4,
nb_signalements_30j: 15, precipitation_mm: 45.0, temperature_c: 28.5,
},
});
}

let result;
let source = "fastapi";

try {
// Tentative appel FastAPI
result = await callFastAPI(body);
console.log(`[Predict] FastAPI → ${result.niveau_risque} (${result.confidence}%)`);
} catch (fastApiErr) {
console.warn(`[Predict] FastAPI indisponible (${fastApiErr.message}) → fallback Python`);
try {
result = await callPythonDirect(body);
source = "python-direct";
} catch (pythonErr) {
console.error("[Predict] Fallback Python aussi échoué :", pythonErr.message);
return res.status(503).json({
success: false,
error:   "Service de prédiction indisponible",
detail:  "FastAPI hors ligne et fallback Python échoué",
action:  `Lancez FastAPI : uvicorn scripts.api_prediction:app --reload --port 8000`,
});
}
}

// Sauvegarde asynchrone en DB (non bloquante)
const userId = req.user?.id || null;
savePredictionToDB(body, result, userId);

// Réponse
return res.status(200).json({
success:       true,
niveau_risque: result.niveau_risque,
confidence:    result.confidence,
probabilities: result.probabilities || null,
source,
input: {
ville:         body.ville,
type_incident: body.type_incident,
gravite:       body.gravite,
latitude:      body.latitude,
longitude:     body.longitude,
},
});
});

// ─── ROUTE GET /api/zones ────────────────────────────────────────────────────
router.get("/zones", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/zones`, { timeout: 3000 });
    return res.json({ success: true, source: "fastapi", data: response.data }); // ← corrigé
  } catch {
// Fallback : retourner les valeurs hardcodées
return res.json({
success: true,
source:  "static",
villes:  VILLES_VALIDES,
types_incident: TYPES_INCIDENT,
niveaux_risque: ["FAIBLE", "MOYEN", "ELEVE"],
});
}
});

// ─── ROUTE GET /api/prediction/health ────────────────────────────────────────
router.get("/prediction/health", async (req, res) => {
let fastApiStatus = false;
let fastApiDetail = null;

try {
const r = await axios.get(`${FASTAPI_URL}/health`, { timeout: 3000 });
fastApiStatus = r.status === 200;
fastApiDetail = r.data;
} catch (err) {
fastApiDetail = err.message;
}

res.json({
fastapi: {
url:       FASTAPI_URL,
available: fastApiStatus,
detail:    fastApiDetail,
},
fallback: {
available: true,
method:    "child_process Python",
script:    PREDICT_SCRIPT,
},
status: fastApiStatus ? "optimal" : "dégradé (fallback actif)",
});
});

export default router;