import React, { useState } from "react";
import axios from "axios";
import "./meteo.css";

export default function MeteoPage() {
  const [ville, setVille] = useState("");
  const [meteo, setMeteo] = useState(null);

  const getMeteo = async (e) => {
    e.preventDefault();
    const res = await axios.get(`[localhost](http://localhost:5000/api/meteo/${ville})`);
    setMeteo(res.data.meteo);
  };

  return (
     <>
    <Navbar />
    <div className="meteo-container">
      <h1>Données Météo des Villes</h1>
      <form onSubmit={getMeteo}>
        <input placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} />
        <button>Voir météo</button>
      </form>

      {meteo && (
        <div className="meteo-info">
          <p>🌡 Température : {meteo.temperature} °C</p>
          <p>💨 Vent : {meteo.windspeed} km/h</p>
          <p>🔄 Direction : {meteo.winddirection}°</p>
        </div>
      )}
    </div>
     <Footer />
  </>
  );
}
