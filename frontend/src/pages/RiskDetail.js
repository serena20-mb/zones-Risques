import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { risquesDetail } from "../data/risquesDetailData";
import "./riskdetail.css";

export default function RiskDetail() {
  const { id } = useParams();
  const data = risquesDetail[id];

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="riskdetail-container">
          <h1>Risque introuvable</h1>
          <Link to="/risques">← Retour aux risques</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
  <div className="page-wrapper">
    <Navbar />
    <div className="page-content">

      <div className="riskdetail-container">
        <Link to="/risques" className="back-link">← Retour aux risques</Link>

        <h1 className="riskdetail-title">{data.title}</h1>
        <p className="riskdetail-intro">{data.intro}</p>

        <div className="stats-grid">
          {data.stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="zones-title">{data.zonesTitle}</h2>
        <div className="zones-grid">
          {data.zones.map((z, i) => (
            <div className="zone-card" key={i}>
              <h3>{z.name}</h3>
              <p>{z.description}</p>
             <div className="riskdetail-actions">
  <Link to={`/risques#${id}`} className="btn-primary-action">
    Voir les mesures de prévention
  </Link>
  <Link to="/map" className="btn-secondary-action">
    ← Retour à la carte
  </Link>
</div> 
            </div>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}