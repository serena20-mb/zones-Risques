"""
model_training.py
==================
Entraînement du modèle RandomForest pour SAFE ZONE.
Génère le modèle, les métriques et la matrice de confusion.

Usage : python model_training.py
Input : data/signalements_clean.csv
Output: model/safezone_rf.pkl
        outputs/metriques_modele.txt
        outputs/matrice_confusion.png
        outputs/importance_features.png
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import joblib, os

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder

os.makedirs("model",   exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# ─── CHARGEMENT DES DONNÉES ───────────────────────────────────────────────────
print(f"\n{'='*55}")
print(f"  ENTRAÎNEMENT DU MODÈLE — SAFE ZONE RandomForest")
print(f"{'='*55}")

df = pd.read_csv("data/signalements_clean.csv")
print(f"  Dataset chargé : {len(df)} lignes")
print(f"  Répartition des classes :")
print(df["niveau_risque"].value_counts().to_string())

# ─── ENCODAGE DES VARIABLES CATÉGORIELLES ────────────────────────────────────
le_type = LabelEncoder()
df["type_incident_enc"] = le_type.fit_transform(df["type_incident"])
joblib.dump(le_type, "model/label_encoder_type.pkl")

le_ville = LabelEncoder()
df["ville_enc"] = le_ville.fit_transform(df["ville"])
joblib.dump(le_ville, "model/label_encoder_ville.pkl")

# ─── SÉLECTION DES FEATURES ──────────────────────────────────────────────────
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
TARGET = "niveau_risque"

X = df[FEATURES]
y = df[TARGET]

print(f"\n  Features utilisées ({len(FEATURES)}) : {FEATURES}")

# ─── SPLIT TRAIN / TEST ───────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n  Train : {len(X_train)} | Test : {len(X_test)}")

# ─── ENTRAÎNEMENT ────────────────────────────────────────────────────────────
print(f"\n  Entraînement en cours...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)
print(f"  ✓ Modèle entraîné")

# ─── ÉVALUATION ───────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
classes = sorted(y.unique())

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
recall    = recall_score(y_test, y_pred, average="weighted", zero_division=0)
f1        = f1_score(y_test, y_pred, average="weighted", zero_division=0)

# Validation croisée (5 folds)
cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy", n_jobs=-1)

print(f"\n{'='*55}")
print(f"  RÉSULTATS")
print(f"{'='*55}")
print(f"  Accuracy   : {accuracy:.2%}")
print(f"  Precision  : {precision:.2%}")
print(f"  Recall     : {recall:.2%}")
print(f"  F1-Score   : {f1:.2%}")
print(f"  CV 5-fold  : {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
print(f"\n  Rapport détaillé :")
print(classification_report(y_test, y_pred, target_names=classes))

# ─── SAUVEGARDE DU RAPPORT TEXTE ─────────────────────────────────────────────
report_text = f"""MÉTRIQUES DU MODÈLE RANDOMFOREST — SAFE ZONE
{'='*50}
Dataset     : {len(df)} signalements
Features    : {len(FEATURES)}
Train/Test  : {len(X_train)} / {len(X_test)} (80/20)
{'='*50}

Accuracy   : {accuracy:.4f} ({accuracy:.2%})
Precision  : {precision:.4f} ({precision:.2%})
Recall     : {recall:.4f} ({recall:.2%})
F1-Score   : {f1:.4f} ({f1:.2%})

Validation croisée (5-fold) :
  Moyenne : {cv_scores.mean():.4f} ({cv_scores.mean():.2%})
  Std Dev : {cv_scores.std():.4f}
  Scores  : {[round(s,4) for s in cv_scores]}

Rapport par classe :
{classification_report(y_test, y_pred, target_names=classes)}
"""

with open("outputs/metriques_modele.txt", "w", encoding="utf-8") as f:
    f.write(report_text)

# ─── MATRICE DE CONFUSION ────────────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred, labels=classes)

fig, ax = plt.subplots(figsize=(7, 5))
im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
plt.colorbar(im, ax=ax)

ax.set_xticks(range(len(classes)))
ax.set_yticks(range(len(classes)))
ax.set_xticklabels(classes, fontsize=11)
ax.set_yticklabels(classes, fontsize=11)
ax.set_xlabel("Prédiction", fontsize=12, fontweight="bold")
ax.set_ylabel("Réalité", fontsize=12, fontweight="bold")
ax.set_title("Matrice de Confusion — Modèle RandomForest SAFE ZONE",
             fontsize=12, fontweight="bold", pad=15)

thresh = cm.max() / 2.0
for i in range(len(classes)):
    for j in range(len(classes)):
        ax.text(j, i, cm[i, j], ha="center", va="center",
                fontsize=14, fontweight="bold",
                color="white" if cm[i, j] > thresh else "#1A7A8A")

plt.tight_layout()
plt.savefig("outputs/matrice_confusion.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"\n  ✓ Matrice de confusion → outputs/matrice_confusion.png")

# ─── IMPORTANCE DES FEATURES ─────────────────────────────────────────────────
importances = model.feature_importances_
indices = np.argsort(importances)[::-1]
feat_names = [FEATURES[i] for i in indices]
feat_vals  = importances[indices]

colors = ["#1A7A8A" if v > 0.1 else "#D0EEF2" for v in feat_vals]

fig, ax = plt.subplots(figsize=(9, 5))
bars = ax.barh(feat_names[::-1], feat_vals[::-1], color=colors[::-1])
ax.set_xlabel("Importance (Gini)", fontsize=11)
ax.set_title("Importance des Features — RandomForest SAFE ZONE",
             fontsize=12, fontweight="bold")
ax.axvline(x=0.1, color="#ef4444", linestyle="--", alpha=0.6, label="Seuil 10%")
ax.legend(fontsize=10)
for bar, val in zip(bars[::-1], feat_vals):
    ax.text(val + 0.002, bar.get_y() + bar.get_height()/2,
            f"{val:.3f}", va="center", fontsize=9)
plt.tight_layout()
plt.savefig("outputs/importance_features.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"  ✓ Importance des features → outputs/importance_features.png")

# ─── SAUVEGARDE DU MODÈLE ────────────────────────────────────────────────────
joblib.dump(model, "model/safezone_rf.pkl")
print(f"  ✓ Modèle sauvegardé → model/safezone_rf.pkl")
print(f"\n{'='*55}")
print(f"  TOUTES LES SORTIES GÉNÉRÉES AVEC SUCCÈS")
print(f"{'='*55}\n")
