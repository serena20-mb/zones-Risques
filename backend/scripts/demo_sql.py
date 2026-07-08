"""
demo_sql.py
============
Démontre les requêtes SQL du projet SAFE ZONE.
Utilise SQLite (portable, pas besoin d'installer MySQL).
Les requêtes sont identiques à celles utilisées avec MySQL.

Usage : python demo_sql.py
Output: outputs/demo_sql_results.txt
        data/safezone.db
"""

import sqlite3, pandas as pd, os

os.makedirs("outputs", exist_ok=True)
os.makedirs("data",    exist_ok=True)

# ─── CRÉATION DE LA BASE DE DONNÉES ──────────────────────────────────────────
conn = sqlite3.connect("data/safezone.db")
cursor = conn.cursor()

# Schéma des tables (identique MySQL)
cursor.executescript("""
DROP TABLE IF EXISTS Historiques;
DROP TABLE IF EXISTS Alertes;
DROP TABLE IF EXISTS Signalements;
DROP TABLE IF EXISTS Zones_Risques;
DROP TABLE IF EXISTS Utilisateurs;

CREATE TABLE Utilisateurs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    role       TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Zones_Risques (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_zone      TEXT NOT NULL,
    ville         TEXT NOT NULL,
    latitude      REAL NOT NULL,
    longitude     REAL NOT NULL,
    NiveauRisque  TEXT CHECK(NiveauRisque IN ('FAIBLE','MOYEN','ELEVE')),
    score_prediction REAL,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Signalements (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    description      TEXT,
    type_incident    TEXT,
    gravite          INTEGER CHECK(gravite BETWEEN 1 AND 5),
    latitude         REAL,
    longitude        REAL,
    ville            TEXT,
    date_signalement TEXT,
    utilisateur_id   INTEGER REFERENCES Utilisateurs(id),
    zone_id          INTEGER REFERENCES Zones_Risques(id)
);

CREATE TABLE Alertes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    type_alerte  TEXT,
    NiveauUrgence TEXT CHECK(NiveauUrgence IN ('INFO','URGENT','CRITIQUE')),
    date_alerte  TEXT DEFAULT CURRENT_TIMESTAMP,
    zone_id      INTEGER REFERENCES Zones_Risques(id)
);

CREATE TABLE Historiques (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    action     TEXT,
    entite     TEXT,
    entite_id  INTEGER,
    utilisateur_id INTEGER REFERENCES Utilisateurs(id),
    date_action TEXT DEFAULT CURRENT_TIMESTAMP
);
""")

# ─── REMPLISSAGE AVEC DES DONNÉES DEPUIS LE CSV ──────────────────────────────
df = pd.read_csv("data/signalements_clean.csv")

# Utilisateurs
utilisateurs = [
    (1, "Alice Kamga",    "alice@safezone.cm",  "user"),
    (2, "Bernard Nkolo",  "bernard@safezone.cm","user"),
    (3, "Claire Mbida",   "claire@safezone.cm", "admin"),
    (4, "David Essama",   "david@safezone.cm",  "user"),
    (5, "Emma Fotso",     "emma@safezone.cm",   "user"),
]
cursor.executemany("INSERT INTO Utilisateurs(id,nom,email,role) VALUES(?,?,?,?)", utilisateurs)

# Zones à risques (une par ville)
zones = []
for i, (ville, grp) in enumerate(df.groupby("ville"), 1):
    lat = round(grp["latitude"].mean(), 4)
    lon = round(grp["longitude"].mean(), 4)
    niveau = grp["niveau_risque"].mode()[0]
    score  = round(grp["risk_score"].mean(), 4)
    zones.append((i, f"Zone {ville}", ville, lat, lon, niveau, score))
    cursor.execute(
        "INSERT INTO Zones_Risques(id,nom_zone,ville,latitude,longitude,NiveauRisque,score_prediction) VALUES(?,?,?,?,?,?,?)",
        (i, f"Zone {ville}", ville, lat, lon, niveau, score)
    )

zone_map = {z[2]: z[0] for z in zones}  # ville → id

# Signalements (500 premiers)
import random; random.seed(42)
sample = df.head(500)
for _, row in sample.iterrows():
    uid  = random.randint(1, 5)
    zid  = zone_map.get(row["ville"], 1)
    cursor.execute("""
        INSERT INTO Signalements(description,type_incident,gravite,
            latitude,longitude,ville,date_signalement,utilisateur_id,zone_id)
        VALUES(?,?,?,?,?,?,?,?,?)
    """, (
        f"Signalement {row['type_incident']} niveau {row['gravite']}",
        row["type_incident"], int(row["gravite"]),
        row["latitude"], row["longitude"], row["ville"],
        row["date_signalement"], uid, zid
    ))

# Alertes
alertes_data = [
    ("inondation",  "CRITIQUE", "2025-11-01 08:00:00", zone_map.get("Douala", 1)),
    ("incendie",    "URGENT",   "2025-11-05 14:30:00", zone_map.get("Yaoundé", 2)),
    ("criminalité", "INFO",     "2025-11-08 20:00:00", zone_map.get("Maroua", 5)),
    ("pollution",   "URGENT",   "2025-11-10 09:00:00", zone_map.get("Douala", 1)),
    ("glissement",  "CRITIQUE", "2025-11-12 07:00:00", zone_map.get("Garoua", 4)),
]
cursor.executemany("INSERT INTO Alertes(type_alerte,NiveauUrgence,date_alerte,zone_id) VALUES(?,?,?,?)", alertes_data)

conn.commit()
print("✓ Base de données créée et remplie : data/safezone.db")

# ─── EXÉCUTION DES REQUÊTES SQL ───────────────────────────────────────────────
output = []
output.append("RÉSULTATS DES REQUÊTES SQL — SAFE ZONE")
output.append("="*55)

print("\n" + "="*55)
print("  EXÉCUTION DES REQUÊTES SQL")
print("="*55)

# REQUÊTE 1 : Zones les plus signalées
print("\n[REQUÊTE 1] Zones avec le plus de signalements :")
q1 = """
    SELECT z.ville, z.NiveauRisque, z.score_prediction,
           COUNT(s.id) AS nb_signalements,
           ROUND(AVG(s.gravite), 2) AS gravite_moyenne
    FROM Zones_Risques z
    LEFT JOIN Signalements s ON s.zone_id = z.id
    GROUP BY z.id, z.ville, z.NiveauRisque, z.score_prediction
    ORDER BY nb_signalements DESC
"""
df_q1 = pd.read_sql_query(q1, conn)
print(df_q1.to_string(index=False))
output.append("\n[1] Zones par nombre de signalements :")
output.append(df_q1.to_string(index=False))

# REQUÊTE 2 : Répartition par type d'incident
print("\n[REQUÊTE 2] Répartition par type d'incident et gravité :")
q2 = """
    SELECT type_incident,
           COUNT(*) AS total,
           ROUND(AVG(gravite), 2) AS gravite_moy,
           SUM(CASE WHEN gravite >= 4 THEN 1 ELSE 0 END) AS incidents_graves
    FROM Signalements
    GROUP BY type_incident
    ORDER BY total DESC
"""
df_q2 = pd.read_sql_query(q2, conn)
print(df_q2.to_string(index=False))
output.append("\n[2] Répartition par type d'incident :")
output.append(df_q2.to_string(index=False))

# REQUÊTE 3 : Alertes actives avec niveau d'urgence
print("\n[REQUÊTE 3] Alertes actives avec zone associée :")
q3 = """
    SELECT a.type_alerte, a.NiveauUrgence, a.date_alerte,
           z.ville, z.NiveauRisque
    FROM Alertes a
    JOIN Zones_Risques z ON a.zone_id = z.id
    ORDER BY CASE a.NiveauUrgence
        WHEN 'CRITIQUE' THEN 1
        WHEN 'URGENT'   THEN 2
        ELSE 3 END
"""
df_q3 = pd.read_sql_query(q3, conn)
print(df_q3.to_string(index=False))
output.append("\n[3] Alertes actives :")
output.append(df_q3.to_string(index=False))

# REQUÊTE 4 : Zones à risque ELEVE uniquement
print("\n[REQUÊTE 4] Zones à risque ELEVE (pour le moteur de prédiction) :")
q4 = """
    SELECT z.ville, z.NiveauRisque, z.score_prediction,
           COUNT(s.id) AS signalements,
           COUNT(a.id) AS alertes_actives
    FROM Zones_Risques z
    LEFT JOIN Signalements s ON s.zone_id = z.id
    LEFT JOIN Alertes a ON a.zone_id = z.id
    WHERE z.NiveauRisque = 'ELEVE'
    GROUP BY z.id, z.ville, z.NiveauRisque, z.score_prediction
    ORDER BY z.score_prediction DESC
"""
df_q4 = pd.read_sql_query(q4, conn)
print(df_q4.to_string(index=False))
output.append("\n[4] Zones à risque ELEVE :")
output.append(df_q4.to_string(index=False))

conn.close()

with open("outputs/demo_sql_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))

print(f"\n✓ Résultats SQL → outputs/demo_sql_results.txt")
print(f"✓ Base SQLite   → data/safezone.db")
