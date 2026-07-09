import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar(){
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return(
    <header className="navbar">
      <div className="logo">
        SAFE<span>ZONE</span>
      </div>

      <nav>
        <Link className={pathname === "/" ? "active" : ""} to="/">Accueil</Link>
        <Link className={pathname === "/map" ? "active" : ""} to="/map">Carte Interactive</Link>
        <Link className={pathname === "/risques" ? "active" : ""} to="/risques">Risques & Prévention</Link>
        <Link className={pathname === "/about" ? "active" : ""} to="/about">À propos</Link>
        <Link className={pathname === "/RapportPreview" ? "active" : ""} to="/RapportPreview">Rapport</Link>
        {user ? (
          <div className="user-menu">
            <button className="userBadge" onClick={() => setMenuOpen(!menuOpen)}>
              👤 {user.name}
            </button>
            {menuOpen && (
              <div className="dropdown">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
                <button onClick={handleLogout}>Se déconnecter</button>
              </div>
            )}
          </div>
        ) : (
          <Link className="loginBtn" to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

