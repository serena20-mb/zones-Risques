import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./map.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { citiesData, getRisksForCity } from "../data/citiesData";

const API_URL = "http://localhost:5000";

const riskIdMap = {
  "Criminalité": "crime",
  "Inondation": "inondation",
  "Tremblement de terre": "seisme",
  "Pollution": "pollution",
};

const graviteColor = { "Élevé": "#dc2626", "Moyen": "#f59e0b", "Faible": "#16a34a" };

function FlyToCity({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target.lat && target.lng) map.flyTo([target.lat, target.lng], 10, { duration: 1.2 });
  }, [target, map]);
  return null;
}
function LocateButton({ position }) {
  const map = useMap();

  const handleLocate = () => {
    if (position) {
      map.flyTo(position, 14, { duration: 1 });
    } else {
      alert("Localisation non disponible. Vérifiez que vous avez autorisé l'accès à votre position.");
    }
  };

  return (
    <button className="locate-btn" onClick={handleLocate} title="Me localiser">
      📍
    </button>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState(citiesData);
  const [position, setPosition] = useState(null);
  const [apiOffline, setApiOffline] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour 👋 Cliquez sur une ville de la carte ou tapez son nom ici." }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/cities`)
      .then((res) => setCities(res.data))
      .catch(() => setApiOffline(true)); // garde citiesData en fallback
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("Géoloc refusée:", err.message),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMarkerClick = (city) => {
    setSelectedCity(city);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const result = getRisksForCity(input);
    setSelectedCity(result);
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        from: "bot",
        text: `📍 ${result.city} — ${result.risks.map(r => `${r.type} (${r.gravite})`).join(", ")}${result.estimated ? " — estimation IA" : ""}`
      }
    ]);
    setInput("");
  };

  return (
    <div className="page-wrapper">
    <Navbar />
    <div className="page-content">
    <div className="map-page">
      <h1 className="map-title">Carte des Zones à Risques</h1>

      {apiOffline && (
        <p className="offline-banner">Backend indisponible — affichage de données d'exemple.</p>
      )}

      <div className="map-layout">
        <div className="map-panel">

          <MapContainer center={[46.6, 2.5]} zoom={6} style={{ height: "60vh", width: "100%", borderRadius: "16px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyToCity target={selectedCity} />
             <LocateButton position={position} />  
            {cities.map((city, i) => (
              <CircleMarker
                key={i}
                center={[city.lat, city.lng]}
                pathOptions={{ color: "#1ba72b" }}
                radius={10}
                eventHandlers={{ click: () => handleMarkerClick(city) }}
              >
                <Popup>
                  <b>{city.city}</b><br />
                  Cliquez pour voir le détail des risques ↓
                </Popup>
              </CircleMarker>
            ))}

            {position && (
              <CircleMarker center={position} pathOptions={{ color: "blue" }} radius={8}>
                <Popup>Vous êtes ici 📍</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>

        <div className="chat-panel">
          <h2>Assistant IA</h2>
          <div className="chat-messages">
            {messages.map((m, i) => <div key={i} className={`chat-bubble ${m.from}`}>{m.text}</div>)}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} className="chat-input-row">
            <input placeholder="Tapez une ville..." value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </div>

      {/* TABLEAU DES RISQUES — apparaît sous la carte au clic, comme sur la version Cameroun */}
      {selectedCity && (
        <div className="risk-table-wrapper">
          <h2>Risques détectés à {selectedCity.city}</h2>
          <table className="risk-table">
            <thead>
              <tr>
                <th>Type de risque</th>
                <th>Niveau de gravité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selectedCity.risks.map((r, i) => (
                <tr
                  key={i}
                  className="risk-row"
                  onClick={() => navigate(`/risque/${riskIdMap[r.type] || ""}`)}
                >
                  <td>{r.type}</td>
                  <td>
                    <span className="gravite-badge" style={{ background: graviteColor[r.gravite] }}>
                      {r.gravite}
                    </span>
                  </td>
                  <td className="see-more">Voir le détail →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
     <Footer />
    </div> 
  );
}
