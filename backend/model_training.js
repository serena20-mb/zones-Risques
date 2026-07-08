import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import axios from "axios";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_EXEC = process.platform === "win32" ? "python" : "python3";
const TRAINING_SCRIPT = path.join(__dirname, "scripts", "model_training.py");
const METRICS_FILE = path.join(__dirname, "outputs", "metriques_modele.txt");
const MODEL_FILE = path.join(__dirname, "model", "safezone_rf.pkl");
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`[ModelTrainer] Lancement : ${PYTHON_EXEC} ${scriptPath}`);

    const proc = spawn(PYTHON_EXEC, [scriptPath, ...args], { cwd: __dirname });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
      if (data.toString().includes("UserWarning") || data.toString().includes("UndefinedMetricWarning")) {
        process.stderr.write(`[ModelTrainer][WARN] ${data}`);
      } else if (data.toString().trim()) {
        process.stderr.write(`[ModelTrainer][ERR] ${data}`);
      }
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Script Python terminé avec code ${code}\nSTDERR: ${stderr}`));
      }
      resolve({ stdout, stderr });
    });

    proc.on("error", (err) => {
      reject(new Error(`Impossible de lancer Python : ${err.message}\nVérifiez que "${PYTHON_EXEC}" est bien installé.`));
    });
  });
}

function readMetrics() {
  try {
    if (!fs.existsSync(METRICS_FILE)) return null;
    const raw = fs.readFileSync(METRICS_FILE, "utf8");

    const get = (label) => {
      const match = raw.match(new RegExp(`${label}\\s*:\\s*([0-9.]+)`));
      return match ? parseFloat(match[1]) : null;
    };

    return {
      accuracy: get("Accuracy"),
      precision: get("Precision"),
      recall: get("Recall"),
      f1Score: get("F1-Score"),
      cvMean: get("Moyenne"),
      rawReport: raw,
    };
  } catch (err) {
    console.error("[ModelTrainer] Erreur lecture métriques :", err.message);
    return null;
  }
}

async function checkFastAPI() {
  try {
    const res = await axios.get(`${FASTAPI_URL}/health`, { timeout: 3000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function trainModel() {
  console.log("\n========================================");
  console.log("SAFE ZONE — Entraînement du modèle IA");
  console.log("========================================\n");

  if (!fs.existsSync(TRAINING_SCRIPT)) {
    throw new Error(`Script Python introuvable : ${TRAINING_SCRIPT}\nPlacez model_training.py dans le dossier scripts/`);
  }

  console.log("[ModelTrainer] Étape 1/3 — Entraînement RandomForest…");
  await runPythonScript(TRAINING_SCRIPT);

  if (!fs.existsSync(MODEL_FILE)) {
    throw new Error(`Modèle non créé. Vérifiez le script Python.`);
  }
  console.log(`\n[ModelTrainer] ✓ Modèle sauvegardé : ${MODEL_FILE}`);

  console.log("[ModelTrainer] Étape 2/3 — Lecture des métriques…");
  const metrics = readMetrics();
  if (metrics) {
    console.log(`[ModelTrainer] ✓ Accuracy  : ${(metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`[ModelTrainer] ✓ F1-Score  : ${(metrics.f1Score * 100).toFixed(2)}%`);
    console.log(`[ModelTrainer] ✓ CV 5-fold : ${(metrics.cvMean * 100).toFixed(2)}%`);
  }

  console.log("[ModelTrainer] Étape 3/3 — Vérification FastAPI…");
  const apiOk = await checkFastAPI();
  if (apiOk) {
    console.log(`[ModelTrainer] ✓ FastAPI disponible sur ${FASTAPI_URL}`);
  } else {
    console.warn(`[ModelTrainer] ⚠ FastAPI non joignable sur ${FASTAPI_URL}`);
  }

  console.log("\n[ModelTrainer] ✓ Entraînement terminé avec succès\n");
  return { success: true, metrics, modelPath: MODEL_FILE };
}

const router = express.Router();

router.post("/train", async (req, res) => {
  try {
    const result = await trainModel();
    res.json({ success: true, message: "Modèle entraîné avec succès", metrics: result.metrics, modelPath: result.modelPath });
  } catch (err) {
    console.error("[ModelTrainer] Erreur :", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/metrics", (req, res) => {
  const metrics = readMetrics();
  if (!metrics) {
    return res.status(404).json({ error: "Aucune métrique disponible. Entraînez d'abord le modèle." });
  }
  res.json({ success: true, metrics });
});

router.get("/status", (req, res) => {
  const modelExists = fs.existsSync(MODEL_FILE);
  const metricsExist = fs.existsSync(METRICS_FILE);
  const metrics = metricsExist ? readMetrics() : null;
  res.json({
    modelReady: modelExists,
    metricsReady: metricsExist,
    modelPath: MODEL_FILE,
    lastMetrics: metrics ? { accuracy: metrics.accuracy, f1Score: metrics.f1Score } : null,
  });
});

export { trainModel, readMetrics, router };

