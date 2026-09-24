// @ts-nocheck
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/BotanicalGarden.css";

interface PlanteApi {
  id: number;
  nom: string;
  humidite_sol: string;       // ex: "45.00" -> déjà un pourcentage
  temperature_ideale: string; // ex: "22.0" -> valeur cible unique (pas de min/max en base)
  sante_globale: "EXCELLENTE" | "BONNE" | "ATTENTION" | "CRITIQUE" | string;
  couleur_led_associee: string;
}

interface MatosApi {
  id: number;
  nom: string;
  type: "capteur" | "actionneur";
  valeur_actuelle: string; // ex: "22.5C", "45%", "OFF"
}

interface PlantView {
  id: number;
  nom: string;
  temperatureActuelle: number | null; // vient du capteur global de la serre
  temperatureIdeale: number;
  humiditeSol: number; // déjà en %
  santeGlobale: string;
}

// L'API expose l'URL de base via VITE_API_URL. Le conteneur "api" (Laravel)
// écoute sur le port 8000 -> mets VITE_API_URL=http://localhost:8000
// dans le docker-compose.yml (service "client") si ce n'est pas déjà fait.
const API_URL = "http://localhost:8000";

// Marge de tolérance autour de temperature_ideale pour la jauge visuelle,
// puisque la table "plantes" ne stocke qu'une valeur cible unique (pas de min/max).
// À ajuster si tu ajoutes des colonnes temperature_min/temperature_max en base.
const TOLERANCE_TEMPERATURE = 3; // °C

const parseValeurCapteur = (valeur: string): number | null => {
  const match = /(-?\d+(?:\.\d+)?)/.exec(valeur ?? "");
  return match ? parseFloat(match[1]) : null;
};

const calculatePercentage = (value: number | null, min: number, max: number): number => {
  if (value === null || isNaN(value)) return 0;
  if (value >= min && value <= max) return 100;
  const diff = value < min ? min - value : value - max;
  return Math.max(10, 100 - diff * 12);
};

const statusToBadge = (sante: string) => {
  const healthy = sante === "EXCELLENTE" || sante === "BONNE";
  return {
    healthy,
    label: healthy ? "SANTÉ NORMALE" : sante === "CRITIQUE" ? "ALERTE CRITIQUE" : "ATTENTION VIGILANCE",
  };
};

function BotanicalGarden() {
  const [plants, setPlants] = useState<PlantView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantesRes, matosRes] = await Promise.all([
          fetch(`${API_URL}/api/plantes`),
          fetch(`${API_URL}/api/matos_iot`),
        ]);

        if (!plantesRes.ok || !matosRes.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const plantesData: PlanteApi[] = await plantesRes.json();
        const matosData: MatosApi[] = await matosRes.json();

        // Capteur de température de la serre (global, appliqué à toutes les plantes)
        const capteurTemp = matosData.find((m) => m.type === "capteur" && /temp/i.test(m.nom));
        const temperatureActuelle = capteurTemp ? parseValeurCapteur(capteurTemp.valeur_actuelle) : null;

        const nextPlants: PlantView[] = plantesData.map((p) => ({
          id: p.id,
          nom: p.nom,
          temperatureActuelle,
          temperatureIdeale: parseFloat(p.temperature_ideale),
          humiditeSol: parseFloat(p.humidite_sol),
          santeGlobale: p.sante_globale,
        }));

        setPlants(nextPlants);
        setError(null);
      } catch (err) {
        console.error("Erreur API :", err);
        setError("Impossible de contacter l'API");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="botanical-container">
      <Navbar />

      <main className="botanical-main">
        {loading && <p>Chargement des données de la serre…</p>}
        {error && <p className="status-badge warning">{error}</p>}

        {plants.map((plant) => {
          const tempMin = plant.temperatureIdeale - TOLERANCE_TEMPERATURE;
          const tempMax = plant.temperatureIdeale + TOLERANCE_TEMPERATURE;
          const tempPercent = calculatePercentage(plant.temperatureActuelle, tempMin, tempMax);
          // humiditeSol est déjà un pourcentage (0-100) : on l'utilise directement comme niveau de jauge.
          const humPercent = Math.min(100, Math.max(0, plant.humiditeSol));
          const { healthy, label } = statusToBadge(plant.santeGlobale);

          return (
            <section key={plant.id} className="plant-section">
              {/* EN-TÊTE DE LA PLANTE */}
              <div className="plant-header">
                <div>
                  <span className="sector-tag">SERRE BOTANIQUE // PLANTE {plant.id}</span>
                  <h1 className="plant-title">{plant.nom}</h1>
                </div>
                <div className={`status-badge ${healthy ? "healthy" : "warning"}`}>
                  <span className="status-dot"></span>
                  {label}
                </div>
              </div>

              <div className="metrics-grid">
                {/* CARTE TEMPÉRATURE */}
                <div className="sensor-card">
                  <div className="card-header">
                    <span>THERMIQUE CANOPÉE</span>
                    <span className={tempPercent > 70 ? "normale" : "critical"}>
                      {tempPercent > 70 ? "● NORMALE" : "● HORS TOLÉRANCE"}
                    </span>
                  </div>

                  <div className="metric-value">
                    {plant.temperatureActuelle ?? "—"} <span className="metric-unit">°C</span>
                  </div>

                  <div className="gauge-section">
                    <div className="gauge-labels">
                      <span>NIVEAU DE SANTÉ</span>
                      <span>{Math.round(tempPercent)}%</span>
                    </div>
                    <div className="gauge-track">
                      <div className="gauge-fill" style={{ width: `${tempPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="card-footer">
                    CIBLE : {plant.temperatureIdeale}°C (± {TOLERANCE_TEMPERATURE}°C)
                  </div>
                </div>

                {/* CARTE HUMIDITÉ */}
                <div className="sensor-card">
                  <div className="card-header">
                    <span>HUMIDITÉ DU SOL</span>
                    <span className={humPercent > 40 ? "normale" : "critical"}>
                      {humPercent > 40 ? "● NORMALE" : "● HORS TOLÉRANCE"}
                    </span>
                  </div>

                  <div className="metric-value">
                    {plant.humiditeSol} <span className="metric-unit">%</span>
                  </div>

                  <div className="gauge-section">
                    <div className="gauge-labels">
                      <span>NIVEAU D'HUMIDITÉ</span>
                      <span>{Math.round(humPercent)}%</span>
                    </div>
                    <div className="gauge-track">
                      <div className="gauge-fill" style={{ width: `${humPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="card-footer">STATUT BACKEND : {plant.santeGlobale}</div>
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

export default BotanicalGarden;
