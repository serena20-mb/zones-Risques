import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./listing.css";

export default function Associations() {
  const assos = [
    { name: "SOS Aide aux Victimes", desc: "Accompagnement juridique et psychologique des victimes d'infractions.", zone: "National" },
    { name: "France Nature Environnement", desc: "Prévention et sensibilisation aux risques environnementaux.", zone: "National" },
    { name: "Protection Civile", desc: "Aide d'urgence et sensibilisation aux risques naturels.", zone: "Régional" },
    { name: "Croix-Rouge Française", desc: "Secours, formation aux gestes qui sauvent et aide sociale.", zone: "National" },
  ];

  return (
    <div className="page-wrapper">
    <Navbar />
    <div className="page-content">

      <div className="listing-container">
        <h1>Associations locales</h1>
        <p className="listing-subtitle">Des structures pour vous accompagner face aux risques.</p>
        <div className="listing-grid">
          {assos.map((a, i) => (
            <div className="listing-card" key={i}>
              <h2>{a.name}</h2>
              <span className="badge">{a.zone}</span>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}