import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaSearch, FaHandshake, FaShieldAlt, FaMapMarkedAlt, FaBell, FaLightbulb, FaFileAlt } from "react-icons/fa";
import "./about.css";

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">

        <section className="about-hero">
          <h1>À PROPOS DE NOUS</h1>
          <p>Votre plateforme de référence pour la détection et la prévention des risques en France</p>
        </section>

        <section className="about-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Notre Mission</h2>
          </div>
          <p className="about-mission-text">
            SafeZone France a été créé suite au constat alarmant de l'augmentation des catastrophes
            naturelles et des risques sécuritaires dans nos villes. Notre objectif est de fournir des
            informations précises et actualisées pour protéger les populations et aider les autorités
            dans la prise de décision.
          </p>

          <div className="about-values-grid">
            <div className="about-value-card">
              <FaSearch className="about-value-icon" />
              <h3>Précision</h3>
              <p>Des données géolocalisées exactes et vérifiées pour une information fiable.</p>
            </div>
            <div className="about-value-card">
              <FaHandshake className="about-value-icon" />
              <h3>Collaboration</h3>
              <p>Nous travaillons avec les communautés locales et les autorités pour une meilleure prévention.</p>
            </div>
            <div className="about-value-card">
              <FaShieldAlt className="about-value-icon" />
              <h3>Protection</h3>
              <p>La sécurité des populations est au cœur de toutes nos actions et recommandations.</p>
            </div>
          </div>
        </section>

        <section className="about-section page-bg">
          <div className="section-title-wrapper">
            <h2 className="section-title">Nos Services</h2>
          </div>

          <div className="about-services-grid">
            <div className="about-service-card">
              <FaMapMarkedAlt className="about-service-icon" />
              <h3>Cartographie des risques</h3>
              <p>Visualisation interactive des zones à risques à travers toute la France.</p>
            </div>
            <div className="about-service-card">
              <FaBell className="about-service-icon" />
              <h3>Alertes en temps réel</h3>
              <p>Notifications immédiates en cas de nouveaux risques identifiés.</p>
            </div>
            <div className="about-service-card">
              <FaLightbulb className="about-service-icon" />
              <h3>Conseils de prévention</h3>
              <p>Guides pratiques pour se préparer face aux différents risques.</p>
            </div>
            <div className="about-service-card">
              <FaFileAlt className="about-service-icon" />
              <h3>Rapports détaillés</h3>
              <p>Statistiques et analyses approfondies par région et type de risque.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Notre Technologie</h2>
          </div>

          <div className="about-progress-list">
            {[
              { label: "Analyse des données géospatiales", value: 90 },
              { label: "Prévision des catastrophes naturelles", value: 80 },
              { label: "Visualisation graphique des données", value: 95 },
              { label: "Alertes en temps réel", value: 85 },
            ].map((item, i) => (
              <div className="about-progress-item" key={i}>
                <span className="about-progress-label">{item.label}</span>
                <div className="about-progress-bar-bg">
                  <div className="about-progress-bar-fill" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-contact">
          <h2>Contactez-nous</h2>
          <p>📧 contact@safezone-france.fr</p>
          <p>📞 +33 1 XX XX XX XX</p>
        </section>

      </div>
      <Footer />
    </div>
  );
}