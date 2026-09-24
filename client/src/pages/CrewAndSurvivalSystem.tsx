import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import ScheduleItem from "../components/ScheduleItem";
import '../styles/CrewAndSurvivalSystem.css'
import type { ResourceData, } from '../types/resource';
import type { PlanningData } from '../types/planning';
import { lire } from "../types/api";
import { AlertPlanning } from "../components/AlertPlanning";

function CrewAndSurvivalSystem() {
    const [resources, setResources] = useState<ResourceData[]>([]);
    const [planning, setPlanning] = useState<PlanningData[]>([]);
    const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pour charger toutes les données
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

    // Fonction pour cocher et décocher
    const handleToggleTask = (id: number) => {
        setCompletedTaskIds((prev) =>
            prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
        );
    };

    // Affichages conditionnels 
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
                    <AlertPlanning 
                        itemPlanning={planning}
                        completedTaskIds={completedTaskIds}
                        onValidateTask={handleToggleTask}
                    />
                    <article className="planning-cards">
                        {planning.slice(1).map((itemPlanning) => (
                            <ScheduleItem
                                key={itemPlanning.id}
                                itemPlanning={itemPlanning}
                                isDone={completedTaskIds.includes(itemPlanning.id)}
                                onToggle={() => handleToggleTask(itemPlanning.id)}
                            />
                        ))
                        }
                    </article>
                </section>
            </div>

        </>
    )
}

export default CrewAndSurvivalSystem;