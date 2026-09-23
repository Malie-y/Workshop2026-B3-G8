// @ts-nocheck
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/BotanicalGarden.css";

interface PlantData {
  id: number;
  plante: string;
  secteur: string;
  temperature: number | string;
  humidite: number | string;
  tempIdeale: { min: number; max: number };
  humIdeale: { min: number; max: number };
}

const calculatePercentage = (value: number | string, min: number, max: number): number => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return 0;
  if (numValue >= min && numValue <= max) return 100;

  const diff = numValue < min ? min - numValue : numValue - max;
  return Math.max(10, 100 - diff * 12);
};

function BotanicalGarden() {
  // Liste des plantes (Plante 1 et Plante 2 en dessous)
  const [plants, setPlants] = useState<PlantData[]>([
    {
      id: 1,
      plante: "Tomate",
      secteur: "SECTEUR 01",
      temperature: 22.4,
      humidite: 55,
      tempIdeale: { min: 18, max: 26 },
      humIdeale: { min: 40, max: 70 },
    },
    {
      id: 2,
      plante: "Patate",
      secteur: "SECTEUR 01",
      temperature: 19.8,
      humidite: 62,
      tempIdeale: { min: 15, max: 23 },
      humIdeale: { min: 50, max: 80 },
    },
  ]);

  useEffect(() => {
    const fetchDerniereMesure = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_derniere_mesure.php");
        if (response.ok) {
          const result = await response.json();
          if (result.temperature) {
            // Mettre à jour la première plante avec les données réelles de l'API
            setPlants((prevPlants) =>
              prevPlants.map((plant) =>
                plant.id === 1 ? { ...plant, ...result } : plant
              )
            );
          }
        }
      } catch (err) {
        console.error("Erreur API :", err);
      }
    };

    fetchDerniereMesure();
    const interval = setInterval(fetchDerniereMesure, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="botanical-container">
      <Navbar />

      <main className="botanical-main">
        {plants.map((plant) => {
          const tempPercent = calculatePercentage(
            plant.temperature,
            plant.tempIdeale.min,
            plant.tempIdeale.max
          );
          const humPercent = calculatePercentage(
            plant.humidite,
            plant.humIdeale.min,
            plant.humIdeale.max
          );
          const isHealthy = tempPercent > 70 && humPercent > 70;

          return (
            <section key={plant.id} className="plant-section">
              {/* EN-TÊTE DE LA PLANTE */}
              <div className="plant-header">
                <div>
                  <span className="sector-tag">
                    SERRE BOTANIQUE // {plant.secteur}
                  </span>
                  <h1 className="plant-title">{plant.plante}</h1>
                </div>
                <div className={`status-badge ${isHealthy ? "healthy" : "warning"}`}>
                  <span className="status-dot"></span>
                  {isHealthy ? "SANTÉ NOMINALE" : "ATTENTION VIGILANCE"}
                </div>
              </div>

              {/* GRILLE DES MESURES (TEMPÉRATURE & HUMIDITÉ) */}
              <div className="metrics-grid">
                
                {/* CARTE TEMPÉRATURE */}
                <div className="sensor-card">
                  <div className="card-header">
                    <span>THERMIQUE CANOPÉE</span>
                    <span className={tempPercent > 70 ? "nominal" : "critical"}>
                      {tempPercent > 70 ? "● NOMINAL" : "● HORSTOLÉRANCE"}
                    </span>
                  </div>

                  <div className="metric-value">
                    {plant.temperature} <span className="metric-unit">°C</span>
                  </div>

                  <div className="gauge-section">
                    <div className="gauge-labels">
                      <span>NIVEAU DE SANTÉ</span>
                      <span>{Math.round(tempPercent)}%</span>
                    </div>
                    <div className="gauge-track">
                      <div
                        className="gauge-fill"
                        style={{ width: `${tempPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-footer">
                    PLAGE IDÉALE : {plant.tempIdeale.min}°C — {plant.tempIdeale.max}°C
                  </div>
                </div>

                {/* CARTE HUMIDITÉ */}
                <div className="sensor-card">
                  <div className="card-header">
                    <span>HYGROMÉTRIE AIR</span>
                    <span className={humPercent > 70 ? "nominal" : "critical"}>
                      {humPercent > 70 ? "● NOMINAL" : "● HORSTOLÉRANCE"}
                    </span>
                  </div>

                  <div className="metric-value">
                    {plant.humidite} <span className="metric-unit">% RH</span>
                  </div>

                  <div className="gauge-section">
                    <div className="gauge-labels">
                      <span>NIVEAU DE SANTÉ</span>
                      <span>{Math.round(humPercent)}%</span>
                    </div>
                    <div className="gauge-track">
                      <div
                        className="gauge-fill"
                        style={{ width: `${humPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-footer">
                    PLAGE IDÉALE : {plant.humIdeale.min}% — {plant.humIdeale.max}%
                  </div>
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