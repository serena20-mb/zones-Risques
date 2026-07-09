import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const API_URL = "http://localhost:5000";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" ou "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      }
      const res = await axios.post(
    `${API_URL}/api/auth/login`,
    { email, password }
);


localStorage.setItem("token", res.data.token);

login(res.data.user);

navigate("/map");
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue.");
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
   <div className="page-wrapper">
    <Navbar />
    <div className="page-content"></div>
      <div className="login-page">
        <div className="login-box">
          <h1>{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
          <p className="subtitle">Accédez à la carte et à la géolocalisation.</p>

          {location.state?.blocked && (
            <p className="warning">Connectez-vous pour accéder à cette page.</p>
          )}
          {error && <p className="warning">{error}</p>}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="loginSubmit">
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="switch-mode">
            {mode === "login" ? (
              <>Pas encore de compte ? <span onClick={() => setMode("register")}>Créer un compte</span></>
            ) : (
              <>Déjà un compte ? <span onClick={() => setMode("login")}>Se connecter</span></>
            )}
          </p>

          <div className="divider"><span>ou</span></div>

          <button className="guestBtn" onClick={handleGuest}>
            Explorer sans compte (accès limité)
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}