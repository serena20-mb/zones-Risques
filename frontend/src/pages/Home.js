import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaHandsHelping, FaChartBar, FaNewspaper, FaShieldAlt } from "react-icons/fa";
import "./Home.css";

export default function Home(){
  return(
    <div className="page-wrapper">
      <Navbar/>
     <div className="page-content">
      <section className="hero">
        <div className="overlay">
          <h1>SAFE ZONE FRANCE</h1>
          <p>
            Visualisez les zones à risques, consultez les alertes en temps réel et utilisez notre
            Intelligence Artificielle pour estimer les risques avant vos déplacements.
          </p>
          <Link to="/map">
            <button>Explorer la carte</button>
          </Link>
        </div>
      </section>

      <section className="cards">
        <Link to="/associations" className="card">
          <FaHandsHelping className="icon"/>
          <h2>Associations locales</h2>
          <p>Trouvez les associations d'aide et de prévention près de chez vous.</p>
        </Link>

        <Link to="/statistiques" className="card">
          <FaChartBar className="icon"/>
          <h2>Statistiques</h2>
          <p>Consultez les chiffres clés des risques par région.</p>
        </Link>

        <Link to="/actualites" className="card">
          <FaNewspaper className="icon"/>
          <h2>Événements récents</h2>
          <p>Suivi des incidents et alertes signalés en temps réel.</p>
        </Link>

        <Link to="/risques" className="card">
          <FaShieldAlt className="icon"/>
          <h2>Conseils de sécurité</h2>
          <p>Les bons réflexes selon le type de risque rencontré.</p>
        </Link>
      </section>
      </div>
      <Footer/>
    </div>
  );
}