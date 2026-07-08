"""
pipeline_nettoyage.py
======================
Pipeline de nettoyage des données SAFE ZONE.
Applique les règles C3 du référentiel RNCP37827.

Usage : python pipeline_nettoyage.py
Input : data/signalements_raw.csv
Output: data/signalements_clean.csv
        outputs/rapport_nettoyage.txt
"""

import pandas as pd
import numpy as np
import os

os.makedirs("data", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# ─── Chargement ──────────────────────────────────────────────────────────────
df = pd.read_csv("data/signalements_raw.csv")
n_initial = len(df)
print(f"\n{'='*55}")
print(f"  PIPELINE DE NETTOYAGE — SAFE ZONE")
print(f"{'='*55}")
print(f"  Lignes initiales : {n_initial}")
print(f"  Colonnes         : {list(df.columns)}")
print(f"{'='*55}\n")

rapport = []
rapport.append("RAPPORT DE NETTOYAGE DES DONNÉES — SAFE ZONE")
rapport.append("="*50)
rapport.append(f"Lignes initiales : {n_initial}")

# ─── ÉTAPE 1 : Suppression des doublons ──────────────────────────────────────
before = len(df)
df = df.drop_duplicates(
    subset=["latitude", "longitude", "date_signalement", "type_incident"]
)
removed_dup = before - len(df)
print(f"[1/5] Doublons supprimés       : {removed_dup} lignes")
rapport.append(f"\n[1] Doublons supprimés : {removed_dup}")

# ─── ÉTAPE 2 : Filtrage coordonnées GPS (France métropolitaine) ──────────────
before = len(df)
# Plage géographique valide pour la France métropolitaine
LAT_MIN, LAT_MAX = 41.0, 51.5
LON_MIN, LON_MAX = -5.5, 9.7
mask_geo = (
    df["latitude"].between(LAT_MIN, LAT_MAX) &
    df["longitude"].between(LON_MIN, LON_MAX)
)
bad_coords = (~mask_geo).sum()
df = df[mask_geo].copy()
print(f"[2/5] Coordonnées hors plage   : {bad_coords} lignes supprimées")
rapport.append(f"[2] Coordonnées GPS invalides supprimées : {bad_coords}")

# ─── ÉTAPE 3 : Correction des valeurs aberrantes ─────────────────────────────
# Gravité doit être entre 1 et 5
before_grav = df["gravite"].copy()
df["gravite"] = df["gravite"].clip(1, 5)
fixed_grav = (before_grav != df["gravite"]).sum()
print(f"[3/5] Gravités hors [1-5]      : {fixed_grav} valeurs corrigées (clip)")
rapport.append(f"[3] Gravités aberrantes corrigées (clip 1-5) : {fixed_grav}")

# ─── ÉTAPE 4 : Valeurs manquantes ────────────────────────────────────────────
nulls_before = df.isnull().sum()
null_total = nulls_before.sum()

# Colonnes numériques → médiane
num_cols = ["precipitation_mm", "temperature_c", "nb_signalements_30j"]
for col in num_cols:
    mediane = df[col].median()
    df[col] = df[col].fillna(mediane)
    rapport.append(f"  {col} : {nulls_before[col]} valeurs → remplacement médiane={mediane:.1f}")

print(f"[4/5] Valeurs manquantes       : {int(null_total)} imputées (médiane)")

# ─── ÉTAPE 5 : Uniformisation des formats ────────────────────────────────────
# Arrondi coordonnées à 4 décimales (~11m de précision)
df["latitude"]  = df["latitude"].round(4)
df["longitude"] = df["longitude"].round(4)

# Harmonisation des types d'incidents (lowercase, sans accents)
df["type_incident"] = df["type_incident"].str.lower().str.strip()

# Format date uniforme
df["date_signalement"] = pd.to_datetime(df["date_signalement"])
df["annee"]  = df["date_signalement"].dt.year
df["mois"]   = df["date_signalement"].dt.month
df["heure"]  = df["date_signalement"].dt.hour
df["jour_semaine"] = df["date_signalement"].dt.weekday
df["date_signalement"] = df["date_signalement"].dt.strftime("%Y-%m-%d %H:%M:%S")

print(f"[5/5] Formats uniformisés      : coordonnées (4 déc.), dates (ISO), textes")

# ─── RÉSULTATS ────────────────────────────────────────────────────────────────
n_final = len(df)
taux_nettoyage = (n_initial - n_final) / n_initial * 100

print(f"\n{'='*55}")
print(f"  RÉSULTATS DU NETTOYAGE")
print(f"{'='*55}")
print(f"  Lignes initiales  : {n_initial}")
print(f"  Lignes finales    : {n_final}")
print(f"  Lignes supprimées : {n_initial - n_final} ({taux_nettoyage:.1f}%)")
print(f"  Qualité dataset   : {(n_final/n_initial)*100:.1f}% de données valides")
print(f"\n  Répartition finale des niveaux de risque :")
print(df["niveau_risque"].value_counts().to_string())
print(f"{'='*55}\n")

# ─── AVANT / APRÈS (extrait pour capture) ────────────────────────────────────
df_raw = pd.read_csv("data/signalements_raw.csv")
print("EXEMPLE AVANT NETTOYAGE (5 premières lignes) :")
print(df_raw[["ville","latitude","longitude","gravite","precipitation_mm"]].head(5).to_string())
print("\nEXEMPLE APRÈS NETTOYAGE (5 premières lignes) :")
print(df[["ville","latitude","longitude","gravite","precipitation_mm"]].head(5).to_string())

# ─── SAUVEGARDE ──────────────────────────────────────────────────────────────
df.to_csv("data/signalements_clean.csv", index=False)
rapport.append(f"\nRÉSULTAT FINAL")
rapport.append(f"Lignes initiales  : {n_initial}")
rapport.append(f"Lignes finales    : {n_final}")
rapport.append(f"Lignes supprimées : {n_initial - n_final} ({taux_nettoyage:.1f}%)")
with open("outputs/rapport_nettoyage.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(rapport))

print(f"\n✓ Données nettoyées sauvegardées : data/signalements_clean.csv")
print(f"✓ Rapport de nettoyage           : outputs/rapport_nettoyage.txt")
