import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./listing.css";

export default function Statistiques() {
  const stats = [
    { value: "+12%", label: "Vols signalés en 2025" },
    { value: "40k", label: "Habitations en zone inondable" },
    { value: "22%", label: "Jours de pics de pollution" },
    { value: "200+", label: "Secousses mineures détectées / an" },
  ];

  return (
    <div className="page-wrapper">
    <Navbar />
    <div className="page-content">

      <div className="listing-container">
        <h1>Statistiques</h1>
        <p className="listing-subtitle">Chiffres clés des risques recensés en France.</p>
        <div className="stats-grid-page">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}