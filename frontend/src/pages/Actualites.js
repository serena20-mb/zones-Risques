import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { evenements, graviteColor, riskIdMap } from "../data/evenementsData";
import "./actualites.css";

export default function Actualites() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-bg page-content">
        <div className="actu-container">
          <div className="section-title-wrapper">
            <h1 className="section-title">Événements récents</h1>
          </div>
          <p className="listing-subtitle" style={{ textAlign: "center" }}>
            Suivi en temps réel des incidents liés aux risques en France.
          </p>

          <div className="events-list">
            {evenements.map((e) => (
              <div className="event-card" key={e.id}>
                <span
                  className="event-badge"
                  style={{ background: graviteColor[e.gravite] }}
                >
                  {e.gravite}
                </span>
                <div className="event-body">
                  <div className="event-top">
                    <h3>{e.type} — {e.ville}</h3>
                    <span className="event-date">{e.date}</span>
                  </div>
                  <p>{e.description}</p>
                  <Link to={`/risque/${riskIdMap[e.type]}`} className="event-link">
                    Voir le détail du risque →
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