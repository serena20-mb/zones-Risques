import { FaExclamationTriangle, FaWater, FaHouseDamage, FaSmog, FaSun, FaUsers} from "react-icons/fa";

export const risquesData = [
  {
    id: "crime",
    type: "Criminalité",
    icon: FaExclamationTriangle,
    image: "/images/crimi.jpg",
    description: "Zones avec taux élevé de vols, agressions ou violence.",
    prevention: [
      "Évitez de vous isoler dans les zones mal éclairées la nuit.",
      "Signalez tout comportement suspect à la police (17).",
      "Ne laissez pas d'objets de valeur visibles dans votre véhicule.",
      "Privilégiez les itinéraires fréquentés et bien éclairés.",
    ],
  },
  {
    id: "inondation",
    type: "Inondation",
    icon: FaWater,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&q=80",
    description: "Accumulation d'eau, crues, drainage insuffisant.",
    prevention: [
      "Repérez les points hauts et les itinéraires d'évacuation.",
      "Préparez un kit d'urgence (eau, nourriture, médicaments, lampe).",
      "Mettez vos documents importants dans un sac étanche.",
      "Surveillez les alertes météo et les consignes des autorités.",
    ],
  },
  {
    id: "seisme",
    type: "Tremblement de terre",
    icon: FaHouseDamage,
    image: "/images/tremble.jpg",
    description: "Risque sismique dans les zones sensibles.",
    prevention: [
      "Identifiez les endroits sûrs de votre logement (sous une table solide).",
      "Fixez les meubles lourds et objets susceptibles de tomber.",
      "Préparez un kit de survie (eau, lampe, radio à piles).",
      "Après la secousse, éloignez-vous des bâtiments endommagés.",
    ],
  },
  {
    id: "pollution",
    type: "Pollution",
    icon: FaSmog,
    image: "/images/pol.jpg",
    description: "Pollution de l'air, des sols ou de l'eau.",
    prevention: [
      "Consultez l'indice de qualité de l'air avant de sortir.",
      "Limitez les activités physiques intenses en cas de pic.",
      "Aérez votre logement aux heures les moins polluées.",
      "Privilégiez les transports en commun ou le vélo.",
    ],
},
  {
    id: "secheresse",
    type: "Sécheresse",
    icon: FaSun,
    image: "/images/secheresse.jpg",
    description: "Zones affectées par le manque chronique d'eau et les restrictions.",
    prevention: [
      "Limitez votre consommation d'eau non essentielle.",
      "Respectez les restrictions d'arrosage en vigueur.",
      "Surveillez les risques d'incendie accrus en période sèche.",
      "Signalez les fuites d'eau visibles sur la voie publique.",
    ],
  },
  {
    id: "conflits",
    type: "Conflits",
    icon: FaUsers,
    image: "/images/conflit.jpg",
    description: "Zones avec tensions sociales ou rassemblements à risque.",
    prevention: [
      "Restez informé via les canaux officiels en cas de tension.",
      "Évitez les rassemblements non déclarés à risque.",
      "Gardez une trousse de premiers secours à disposition.",
      "Signalez toute situation dangereuse aux autorités compétentes.",
    ],
  },
];