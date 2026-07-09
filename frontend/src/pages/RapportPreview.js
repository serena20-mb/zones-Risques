import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./RapportPreview.css";

function BrowserWindow({ fileName, filePath, children }) {
  return (
    <div className="rp-window">

      <div className="rp-titlebar">
        <div className="rp-tab">
          <span className="rp-tab-dot"></span>
          {fileName}
        </div>

        <div className="rp-window-controls">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="rp-addressbar">
        <span className="rp-nav-icon">◀</span>
        <span className="rp-nav-icon">▶</span>
        <span className="rp-nav-icon">⟳</span>

        <div className="rp-url">
          🔒 {filePath}
        </div>

        <span className="rp-star">★</span>
      </div>

      <div className="rp-toolbar">
        <span>100%</span>
      </div>

      <div className="rp-body">

        <div className="rp-sidebar">
          <div className="rp-thumb"></div>
        </div>

        <div className="rp-content">
          {children}
        </div>

      </div>

    </div>
  );
}

export default function RapportPreview() {

  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

   axios.get(
    "http://localhost:5000/api/rapport",
    {
        headers: {
            Authorization:
                "Bearer " + localStorage.getItem("token")
        }
    }
)

      .then((res) => {

        setRapport(res.data);

        setLoading(false);

      })

      .catch((err) => {

        console.log(err);

        setLoading(false);

      });

  }, []);

  const imprimer = () => {

    window.print();

  };

  if (loading) {

    return (

      <>
        <Navbar />

        <div
          style={{
            textAlign: "center",
            marginTop: "180px",
            marginBottom: "180px",
            fontSize: "24px",
            color: "#2E7D32"
          }}
        >
          Chargement du rapport...
        </div>

        <Footer />

      </>

    );

  }

  return (

    <>

      <Navbar />

      <section className="rp-section">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30
          }}
        >

          <h2 className="rp-heading">

            Rapport National SafeZone France

          </h2>

          <button
            onClick={imprimer}
            className="loginBtn"
          >

            Télécharger PDF

          </button>

        </div>

        <div className="rp-grid">

          <BrowserWindow

            fileName="rapport_safezone_france.pdf"

            filePath="http://localhost:5000/api/rapport"

          >

            <div className="rp-page">

              <h2 className="rp-report-title">

                {rapport.titre}

              </h2>

              <p className="rp-meta">

                Date de génération : {rapport.dateGeneration}

              </p>

              <h3 className="rp-section-title">

                Résumé

              </h3>

              <p className="rp-paragraph">

                {rapport.resume}

              </p>

              <h3 className="rp-section-title">

                Tableau des risques

              </h3>

              <table className="rp-table">

                <thead>

                  <tr>

                    <th>Couleur</th>

                    <th>Type</th>

                    <th>Description</th>

                    <th>Zone</th>

                    <th>Niveau</th>

                  </tr>

                </thead>

                <tbody>

                  {rapport.typesRisques
                    .slice(0, 5)
                    .map((r, index) => (

                      <tr key={index}>

                        <td>

                          <span

                            className="rp-dot"

                            style={{
                              background: r.couleur,
                            }}

                          ></span>

                        </td>

                        <td>{r.nom}</td>

                        <td>{r.description}</td>

                        <td>{r.zone}</td>

                        <td>{r.niveau}</td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </BrowserWindow>
                    <BrowserWindow
            fileName="rapport_safezone_france.pdf"
            filePath="http://localhost:5000/api/rapport"
          >
            <div className="rp-page">

              <h3 className="rp-section-title">
                Statistiques
              </h3>

              <ul className="rp-list">
                {rapport.statistiques.map((stat, index) => (
                  <li key={index}>{stat}</li>
                ))}
              </ul>

              <h3 className="rp-section-title">
                Dernières alertes
              </h3>

              <ul className="rp-list">
                {rapport.dernieresAlertes.map((alerte, index) => (
                  <li key={index}>
                    {alerte.titre || alerte}
                  </li>
                ))}
              </ul>

              <h3 className="rp-section-title">
                Suite des risques
              </h3>

              <table className="rp-table">

                <thead>

                  <tr>

                    <th>Couleur</th>

                    <th>Type</th>

                    <th>Description</th>

                    <th>Zone</th>

                    <th>Niveau</th>

                  </tr>

                </thead>

                <tbody>

                  {rapport.typesRisques
                    .slice(5)
                    .map((r, index) => (

                      <tr key={index}>

                        <td>

                          <span
                            className="rp-dot"
                            style={{
                              background: r.couleur,
                            }}
                          ></span>

                        </td>

                        <td>{r.nom}</td>

                        <td>{r.description}</td>

                        <td>{r.zone}</td>

                        <td>{r.niveau}</td>

                      </tr>

                    ))}

                </tbody>

              </table>

              <div
                style={{
                  marginTop: 25,
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  background: "#f8f8f8"
                }}
              >

                <h4 style={{ color: "#2E7D32" }}>
                  Analyse SafeZone IA
                </h4>

                <p>

                  Ce rapport a été généré automatiquement à partir des
                  données enregistrées dans la base SafeZone France.

                  Les statistiques, alertes et zones à risque sont
                  mises à jour depuis le serveur afin d'aider les
                  citoyens à mieux anticiper les situations de danger.

                </p>

              </div>

            </div>

          </BrowserWindow>

        </div>

      </section>

      <Footer />

    </>

  );

}