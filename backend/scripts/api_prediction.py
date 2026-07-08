"""
api_prediction.py
==================
API FastAPI de prédiction SAFE ZONE.
Expose le modèle RandomForest via un endpoint REST.

Usage :
  pip install fastapi uvicorn
  uvicorn api_prediction:app --reload --port 8000

Test avec curl :
  curl -X POST http://localhost:8000/predict \
    -H "Content-Type: application/json" \
    -d '{"ville":"Douala","latitude":4.05,"longitude":9.77,"type_incident":"inondation","gravite":4,"heure":14,"jour_semaine":2,"mois":11,"nb_signalements_30j":15,"precipitation_mm":45.0,"temperature_c":28.5}'

Endpoints Postman à tester :
  GET  http://localhost:8000/health
  POST http://localhost:8000/predict
  GET  http://localhost:8000/zones
"""

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("FastAPI non installé — Mode démonstration CLI")

import joblib, numpy as np, os, sys

# ─── CHARGEMENT DU MODÈLE ────────────────────────────────────────────────────
MODEL_PATH = "model/safezone_rf.pkl"
LE_TYPE    = "model/label_encoder_type.pkl"
LE_VILLE   = "model/label_encoder_ville.pkl"

if not os.path.exists(MODEL_PATH):
    print("ERREUR : Modèle non trouvé. Exécutez d'abord model_training.py")
    sys.exit(1)

model    = joblib.load(MODEL_PATH)
le_type  = joblib.load(LE_TYPE)
le_ville = joblib.load(LE_VILLE)
print("✓ Modèle chargé")

FEATURES = [
    "latitude", "longitude",
    "type_incident_enc",
    "gravite",
    "heure", "jour_semaine", "mois",
    "nb_signalements_30j",
    "precipitation_mm",
    "temperature_c",
    "ville_enc",
]

def encode_input(data: dict) -> np.ndarray:
    """Encode les features et retourne un array numpy."""
    type_enc  = le_type.transform([data["type_incident"].lower()])[0]
    ville_enc = le_ville.transform([data["ville"]])[0]
    return np.array([[
        data["latitude"], data["longitude"],
        type_enc, data["gravite"],
        data["heure"], data["jour_semaine"], data["mois"],
        data["nb_signalements_30j"],
        data["precipitation_mm"], data["temperature_c"],
        ville_enc
    ]])


# ─── MODE CLI (si FastAPI non disponible) ────────────────────────────────────
if not FASTAPI_AVAILABLE:
    print("\n══ DÉMO CLI — Prédictions sur 5 exemples ══\n")
    exemples = [
        {"ville":"Bordeaux",    "latitude":44.84, "longitude":-0.58, "type_incident":"inondation", "gravite":4, "heure":14, "jour_semaine":2, "mois":11, "nb_signalements_30j":18, "precipitation_mm":65.0, "temperature_c":18.5},
        {"ville":"Paris",       "latitude":48.86, "longitude":2.35,  "type_incident":"criminalité","gravite":3, "heure":22, "jour_semaine":5, "mois":10, "nb_signalements_30j":8,  "precipitation_mm":12.0, "temperature_c":14.0},
        {"ville":"Marseille",   "latitude":43.30, "longitude":5.37,  "type_incident":"incendie",   "gravite":5, "heure":11, "jour_semaine":1, "mois":8,  "nb_signalements_30j":22, "precipitation_mm":2.0,  "temperature_c":34.0},
        {"ville":"Nantes",      "latitude":47.22, "longitude":-1.55, "type_incident":"pollution",  "gravite":1, "heure":8,  "jour_semaine":0, "mois":6,  "nb_signalements_30j":3,  "precipitation_mm":80.0, "temperature_c":19.0},
        {"ville":"Strasbourg",  "latitude":48.57, "longitude":7.75,  "type_incident":"glissement", "gravite":2, "heure":6,  "jour_semaine":3, "mois":4,  "nb_signalements_30j":6,  "precipitation_mm":95.0, "temperature_c":13.0},
    ]
    for ex in exemples:
        X = encode_input(ex)
        pred  = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        conf  = round(max(proba) * 100, 1)
        print(f"  Ville : {ex['ville']:<12} | Type : {ex['type_incident']:<12} | Gravité : {ex['gravite']} → Prédiction : {pred:>6} (confiance {conf}%)")
    print("\n✓ Démonstration terminée")
    sys.exit(0)

# ─── API FASTAPI ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="SAFE ZONE — API de Prédiction",
    description="API REST pour la prédiction des niveaux de risque via RandomForest",
    version="1.0.0"
)

app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class PredictionRequest(BaseModel):
    ville:               str   = Field(..., example="Douala")
    latitude:            float = Field(..., example=4.0511)
    longitude:           float = Field(..., example=9.7679)
    type_incident:       str   = Field(..., example="inondation")
    gravite:             int   = Field(..., ge=1, le=5, example=4)
    heure:               int   = Field(..., ge=0, le=23, example=14)
    jour_semaine:        int   = Field(..., ge=0, le=6, example=2)
    mois:                int   = Field(..., ge=1, le=12, example=11)
    nb_signalements_30j: int   = Field(..., ge=0, example=15)
    precipitation_mm:    float = Field(..., ge=0, example=45.0)
    temperature_c:       float = Field(..., example=28.5)

class PredictionResponse(BaseModel):
    niveau_risque: str
    confidence:    float
    probabilities: dict

@app.get("/health")
def health():
    return {"status": "ok", "service": "safezone-prediction", "model": "RandomForest"}

@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    try:
        X = encode_input(req.dict())
        pred      = model.predict(X)[0]
        probas    = model.predict_proba(X)[0]
        classes   = model.classes_
        confidence = round(float(max(probas)) * 100, 2)
        prob_dict  = {cls: round(float(p)*100, 2) for cls, p in zip(classes, probas)}
        return PredictionResponse(
            niveau_risque=pred,
            confidence=confidence,
            probabilities=prob_dict
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Donnée invalide : {str(e)}")

@app.get("/zones")
def get_zones():
    """Retourne les zones disponibles dans le modèle."""
    return {
        "villes": list(le_ville.classes_),
        "types_incident": list(le_type.classes_),
        "niveaux_risque": ["FAIBLE", "MOYEN", "ELEVE"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
