"""
generate_dataset.py
====================
Génère un dataset réaliste de signalements de zones à risques
pour le projet SAFE ZONE (France).

Usage : python generate_dataset.py
Output : data/signalements_raw.csv  (données brutes avec problèmes)
         data/signalements_clean.csv (données nettoyées)
"""

import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)
os.makedirs("data", exist_ok=True)

# ─── Zones réelles de France ───────────────────────────────────────────────────
ZONES = [
    {"city": "Paris",       "lat": 48.8566, "lon":  2.3522, "base_risk": 0.65},
    {"city": "Lyon",        "lat": 45.7640, "lon":  4.8357, "base_risk": 0.50},
    {"city": "Marseille",   "lat": 43.2965, "lon":  5.3698, "base_risk": 0.70},
    {"city": "Bordeaux",    "lat": 44.8378, "lon": -0.5792, "base_risk": 0.45},
    {"city": "Lille",       "lat": 50.6292, "lon":  3.0573, "base_risk": 0.55},
    {"city": "Nice",        "lat": 43.7102, "lon":  7.2620, "base_risk": 0.40},
    {"city": "Strasbourg",  "lat": 48.5734, "lon":  7.7521, "base_risk": 0.35},
    {"city": "Toulouse",    "lat": 43.6047, "lon":  1.4442, "base_risk": 0.30},
    {"city": "Nantes",      "lat": 47.2184, "lon": -1.5536, "base_risk": 0.40},
    {"city": "Montpellier", "lat": 43.6108, "lon":  3.8767, "base_risk": 0.45},
]

INCIDENT_TYPES = {
    "inondation":     3,
    "incendie":       2,
    "criminalité":    2,
    "accident_route": 2,
    "pollution":      1,
    "glissement":     2,
}

def rand_date(start_days_ago=365):
    start = datetime.now() - timedelta(days=start_days_ago)
    return start + timedelta(
        days=random.randint(0, start_days_ago),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )

def label_risk(score):
    if score < 0.35:   return "FAIBLE"
    elif score < 0.65: return "MOYEN"
    else:              return "ELEVE"

# ─── Génération des données brutes (avec erreurs volontaires) ─────────────────
rows = []
for _ in range(1200):
    zone = random.choice(ZONES)
    inc_type = random.choices(
        list(INCIDENT_TYPES.keys()),
        weights=list(INCIDENT_TYPES.values())
    )[0]
    gravite = random.randint(1, 5)
    date_sig = rand_date(365)

    # Score de risque calculé
    noise = np.random.normal(0, 0.08)
    risk_score = min(1.0, max(0.0,
        zone["base_risk"]
        + gravite * 0.06
        + (0.05 if inc_type in ["inondation", "glissement"] else 0)
        + noise
    ))

    rows.append({
        "ville":             zone["city"],
        "latitude":          round(zone["lat"] + np.random.uniform(-0.05, 0.05), 6),
        "longitude":         round(zone["lon"] + np.random.uniform(-0.05, 0.05), 6),
        "type_incident":     inc_type,
        "gravite":           gravite,
        "date_signalement":  date_sig.strftime("%Y-%m-%d %H:%M:%S"),
        "heure":             date_sig.hour,
        "jour_semaine":      date_sig.weekday(),
        "nb_signalements_30j": random.randint(1, 25),
        "precipitation_mm":  round(random.uniform(0, 120), 1),
        "temperature_c":     round(random.uniform(18, 38), 1),
        "risk_score":        round(risk_score, 4),
        "niveau_risque":     label_risk(risk_score),
    })

df_raw = pd.DataFrame(rows)

# ─── Injection d'erreurs volontaires (pour démonstration du nettoyage) ────────
# 1. Doublons (5%)
n_dup = int(len(df_raw) * 0.05)
duplicates = df_raw.sample(n_dup, random_state=1)
df_raw = pd.concat([df_raw, duplicates], ignore_index=True)

# 2. Coordonnées hors plage France métropolitaine (2%)
n_bad = int(len(df_raw) * 0.02)
bad_idx = df_raw.sample(n_bad, random_state=2).index
df_raw.loc[bad_idx, "latitude"]  = np.random.uniform(-20, 20, n_bad)
df_raw.loc[bad_idx, "longitude"] = np.random.uniform(30, 60, n_bad)

# 3. Valeurs manquantes (3%)
n_null = int(len(df_raw) * 0.03)
for col in ["precipitation_mm", "temperature_c", "nb_signalements_30j"]:
    null_idx = df_raw.sample(n_null, random_state=3).index
    df_raw.loc[null_idx, col] = np.nan

# 4. Gravité hors plage (1%)
n_bad_g = int(len(df_raw) * 0.01)
df_raw.loc[df_raw.sample(n_bad_g, random_state=4).index, "gravite"] = random.choice([0, 6, 99])

df_raw = df_raw.sample(frac=1, random_state=99).reset_index(drop=True)
df_raw.to_csv("data/signalements_raw.csv", index=False)
print(f"✓ Dataset brut généré : {len(df_raw)} lignes → data/signalements_raw.csv")
print(f"  Doublons injectés     : {n_dup}")
print(f"  Coordonnées erronées  : {n_bad}")
print(f"  Valeurs manquantes    : {n_null} par colonne numérique")
print(f"  Gravités aberrantes   : {n_bad_g}")
print(f"  Répartition labels    : {df_raw['niveau_risque'].value_counts().to_dict()}")
