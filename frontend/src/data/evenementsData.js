export const evenements = [
  { id: 1, ville: "Bordeaux", type: "Inondation", gravite: "Élevé", description: "Crue de la Garonne, vigilance orange activée sur les quartiers riverains.", date: "Il y a 2 heures" },
  { id: 2, ville: "Marseille", type: "Pollution", gravite: "Élevé", description: "Pic de particules fines dépassant le seuil d'alerte, circulation alternée en vigueur.", date: "Il y a 5 heures" },
  { id: 3, ville: "Lyon", type: "Criminalité", gravite: "Moyen", description: "Hausse des cambriolages signalée dans le quartier de la Croix-Rousse.", date: "Aujourd'hui" },
  { id: 4, ville: "Lille", type: "Inondation", gravite: "Moyen", description: "Saturation du réseau de drainage suite aux fortes pluies de la nuit.", date: "Hier" },
  { id: 5, ville: "Nice", type: "Tremblement de terre", gravite: "Faible", description: "Légère secousse sismique ressentie, aucun dégât signalé.", date: "Il y a 2 jours" },
  { id: 6, ville: "Paris", type: "Criminalité", gravite: "Moyen", description: "Renforcement de la présence policière suite à plusieurs vols signalés.", date: "Il y a 3 jours" },
];

export const graviteColor = { "Élevé": "#dc2626", "Moyen": "#f59e0b", "Faible": "#16a34a" };
export const riskIdMap = {
  "Criminalité": "crime",
  "Inondation": "inondation",
  "Tremblement de terre": "seisme",
  "Pollution": "pollution",
  "Sécheresse": "secheresse",
  "Conflits": "conflits",
};