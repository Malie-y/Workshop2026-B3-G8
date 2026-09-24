import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import ScheduleItem from "../components/ScheduleItem";
import '../styles/CrewAndSurvivalSystem.css'
import type { ResourceData, } from '../types/resource';
import type { PlanningData } from '../types/planning';
import { lire } from "../types/api";

function CrewAndSurvivalSystem() {
    // 1. Tous les states regroupés au début du composant
    const [resources, setResources] = useState<ResourceData[]>([]);
    const [planning, setPlanning] = useState<PlanningData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Un seul useEffect pour charger toutes les données
    useEffect(() => {
        const fetchData = async () => {
        try {
            setLoading(true);
            
            // Exécution en parallèle des deux requêtes
            const [resourcesData, planningData] = await Promise.all([
            lire<ResourceData[]>('ressources_vitales'),
            lire<PlanningData[]>('routines_quotidiennes')
            ]);

            setResources(resourcesData);
            setPlanning(planningData);
        } catch (err: any) {
            setError(err.message || 'Impossible de charger les données de survie.');
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, []);

    // 3. Les affichages conditionnels uniquement à la fin
    if (loading) return <div className="loading">Chargement des données de survie...</div>;
    if (error) return <div className="error-message">Erreur : {error}</div>;

    return (
        <>
            <Navbar />
            <div className="personal-assistant">
                <section className="section">
                    <p>Ressources critiques</p>
                    <article className="resources-cards">
                        {resources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))
                        }
                    </article>
                </section>

                <section className="section">
                    <p>Routines Vitales</p>
                    <article className="planning-cards">
                        {planning.slice(1).map((item) => (
                            <ScheduleItem key={item.id} item={item} />
                        ))
                        }
                    </article>
                </section>
            </div>

        </>
    )
}

export default CrewAndSurvivalSystem;