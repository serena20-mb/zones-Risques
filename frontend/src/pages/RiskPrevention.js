import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { risquesData } from "../data/risquesData";
import "./risques.css";

export default function RisquesPrevention() {
  const [activeTab, setActiveTab] = useState(risquesData[0].type);
  const activeRisque = risquesData.find((r) => r.type === activeTab);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-bg page-content">
        <div className="risk-container">

          <div className="section-title-wrapper">
            <h1 className="section-title">Nos Risques</h1>
          </div>

          <div className="risk-grid">
            {risquesData.map((r) => (
              <div className="risk-card" key={r.id}>
                <img src={r.image} alt={r.type} />
                <div className="risk-body">
                  <h3>{r.type}</h3>
                  <p>{r.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title-wrapper" style={{ marginTop: "60px" }}>
            <h1 className="section-title">Comment se protéger</h1>
          </div>

          <div className="risk-tabs-row">
            {risquesData.map((r) => (
              <button
                key={r.id}
                className={`risk-tab-btn ${activeTab === r.type ? "active" : ""}`}
                onClick={() => setActiveTab(r.type)}
              >
                {r.type}
              </button>
            ))}
          </div>

          <div className="risk-conseils-box">
            <h2>Que faire en cas de {activeRisque.type.toLowerCase()} ?</h2>
            <ul>
              {activeRisque.prevention.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
