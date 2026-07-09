export const risquesDetail = {
  crime: {
    title: "Gravité de la Criminalité",
    intro: "La criminalité reste un enjeu majeur en France, affectant la sécurité des citoyens et la qualité de vie dans certains quartiers. Les types de criminalité varient des vols à main armée aux violences domestiques.",
    stats: [
      { value: "+12%", label: "augmentation des vols signalés en 2025" },
      { value: "85k", label: "victimes recensées chaque année" },
      { value: "18%", label: "des délits liés à la violence domestique" },
      { value: "30+", label: "incidents signalés par mois" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Paris (Île-de-France)", description: "Certains arrondissements connaissent une hausse des vols à la tire et cambriolages." },
      { name: "Marseille (Provence)", description: "Les quartiers nord restent sous surveillance renforcée en raison du trafic organisé." },
      { name: "Lyon (Rhône)", description: "Une augmentation des agressions est constatée en centre-ville la nuit." },
    ],
  },
  inondation: {
    title: "Gravité des Inondations",
    intro: "Les inondations touchent régulièrement certaines régions françaises en raison de la topographie, du drainage insuffisant et des épisodes climatiques intenses.",
    stats: [
      { value: "+20%", label: "de crues signalées ces 5 dernières années" },
      { value: "40k", label: "habitations en zone inondable" },
      { value: "12%", label: "des communes classées à risque" },
      { value: "15+", label: "alertes émises par saison des pluies" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Bordeaux (Gironde)", description: "Les crues de la Garonne affectent régulièrement les quartiers riverains." },
      { name: "Lille (Hauts-de-France)", description: "Le réseau de drainage urbain est fréquemment saturé lors de fortes pluies." },
      { name: "Montpellier (Occitanie)", description: "Les épisodes cévenols provoquent des crues soudaines." },
    ],
  },
  seisme: {
    title: "Gravité des Tremblements de Terre",
    intro: "Le risque sismique reste modéré en France métropolitaine mais certaines zones, notamment dans le sud-est et l'est, nécessitent une vigilance particulière.",
    stats: [
      { value: "Zone 3-4", label: "niveau de risque sismique (sud-est)" },
      { value: "200+", label: "secousses mineures détectées par an" },
      { value: "5%", label: "des bâtiments aux normes parasismiques renforcées" },
      { value: "1", label: "séisme notable tous les 10 ans en moyenne" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Nice (Alpes-Maritimes)", description: "Zone de sismicité modérée à surveiller le long de la faille alpine." },
      { name: "Strasbourg (Alsace)", description: "Activité sismique liée au fossé rhénan." },
      { name: "Pyrénées", description: "Zone la plus active de France métropolitaine." },
    ],
  },
  pollution: {
    title: "Gravité de la Pollution",
    intro: "La pollution de l'air et de l'eau touche particulièrement les grandes agglomérations et les zones industrielles, avec un impact direct sur la santé publique.",
    stats: [
      { value: "+8%", label: "de pics de pollution en zone urbaine" },
      { value: "60k", label: "personnes exposées à un air de mauvaise qualité" },
      { value: "22%", label: "des jours avec seuil d'alerte dépassé" },
      { value: "10+", label: "sites industriels sous surveillance" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Marseille (Bouches-du-Rhône)", description: "Le trafic portuaire et industriel dégrade la qualité de l'air." },
      { name: "Paris (Île-de-France)", description: "Le trafic routier dense génère des pics de particules fines." },
      { name: "Lyon (Rhône)", description: "La vallée de la chimie reste un point de vigilance environnementale." },
    ],
  },
  secheresse: {
    title: "Gravité de la Sécheresse",
    intro: "Certaines régions françaises connaissent des périodes de sécheresse de plus en plus fréquentes, affectant l'agriculture, l'approvisionnement en eau et augmentant les risques d'incendie.",
    stats: [
      { value: "+25%", label: "de jours de restriction d'eau depuis 2020" },
      { value: "40", label: "départements en vigilance sécheresse" },
      { value: "15%", label: "de baisse des nappes phréatiques" },
      { value: "5+", label: "arrêtés de restriction par été" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Montpellier (Occitanie)", description: "Restrictions d'eau récurrentes en période estivale." },
      { name: "Toulouse (Occitanie)", description: "Baisse notable du niveau des cours d'eau chaque été." },
      { name: "Marseille (PACA)", description: "Risque accru d'incendies de forêt en zone périurbaine." },
    ],
  },
  conflits: {
    title: "Gravité des Conflits Sociaux",
    intro: "Certaines zones urbaines connaissent des tensions sociales ponctuelles pouvant donner lieu à des rassemblements à risque ou des troubles à l'ordre public.",
    stats: [
      { value: "+10%", label: "de rassemblements signalés en 2025" },
      { value: "12", label: "grandes villes sous vigilance renforcée" },
      { value: "8%", label: "des interventions liées à des troubles" },
      { value: "20+", label: "manifestations encadrées par mois" },
    ],
    zonesTitle: "Zones les plus touchées",
    zones: [
      { name: "Paris (Île-de-France)", description: "Zones centrales régulièrement concernées par des manifestations." },
      { name: "Lyon (Rhône)", description: "Tensions ponctuelles dans certains quartiers sensibles." },
      { name: "Marseille (Bouches-du-Rhône)", description: "Vigilance renforcée lors de grands rassemblements." },
    ],
  },
};