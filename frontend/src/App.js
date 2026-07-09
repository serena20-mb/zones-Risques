import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";
import RisquesPrevention from "./pages/RiskPrevention";
import RiskDetail from "./pages/RiskDetail";
import AboutPage from "./pages/AboutPage";
import Associations from "./pages/Associations";
import Statistiques from "./pages/Statistiques";
import Actualites from "./pages/Actualites";
import Dashboard from "./pages/Dashboard";
import RapportPreview from "./pages/RapportPreview";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/risques" element={<RisquesPrevention />} />
          <Route path="/risque/:id" element={<RiskDetail />} />
          <Route path="/about" element={<AboutPage />} />
           <Route path="/RapportPreview" element={<RapportPreview/>} />
          <Route path="/dashboard" element={
  <ProtectedRoute><Dashboard /></ProtectedRoute>
} />
          <Route path="/associations" element={<Associations />} />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/map" element={
            <ProtectedRoute><MapPage /></ProtectedRoute>
          } />
        </Routes>
      
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;