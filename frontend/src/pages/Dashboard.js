import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./dashboard.css";
import { Link } from "react-router-dom";
const API_URL = "http://localhost:5000";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/logs`)
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const totalPredictions = logs.filter((l) => l.type === "prediction").length;
  const totalErrors = logs.filter((l) => l.type === "error").length;

  const cityCounts = logs.reduce((acc, l) => {
    if (l.city) acc[l.city] = (acc[l.city] || 0) + 1;
    return acc;
  }, {});
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0];
<Link className="dashboard-btn" to="/rapport">

📄 Générer le rapport

</Link>
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));


  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-bg page-content">
        <div className="dash-container">
          <div className="section-title-wrapper">
            <h1 className="section-title">Tableau de bord — Monitoring IA</h1>
          </div>

          {error && (
            <p className="dash-offline">
              Impossible de contacter le backend. Vérifiez que le serveur Node tourne sur le port 5000.
            </p>
          )}

          {!error && (
            <>
              <div className="dash-stats-grid">
                <div className="dash-stat-card">
                  <div className="dash-stat-value">{logs.length}</div>
                  <div className="dash-stat-label">Événements enregistrés</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-value">{totalPredictions}</div>
                  <div className="dash-stat-label">Prédictions réussies</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-value">{totalErrors}</div>
                  <div className="dash-stat-label">Erreurs signalées</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-value">{topCity ? topCity[0] : "—"}</div>
                  <div className="dash-stat-label">Ville la plus demandée</div>
                </div>
              </div>

              <div className="dash-table-wrapper">
                <h2>Historique des événements</h2>
                {loading ? (
                  <p>Chargement...</p>
                ) : logs.length === 0 ? (
                  <p>Aucun événement enregistré pour le moment.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Date / heure</th>
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Résultat / Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLogs.map((log, i) => (
                        <tr key={i}>
                          <td>{new Date(log.date).toLocaleString("fr-FR")}</td>
                          <td>
                            <span className={`dash-badge ${log.type}`}>{log.type}</span>
                          </td>
                          <td>{log.city || "-"}</td>
                          <td>{log.result || log.message || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}