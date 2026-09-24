import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import ScheduleItem from "../components/ScheduleItem";
import '../styles/CrewAndSurvivalSystem.css'
import type { ResourceData, } from '../types/resource';
import type { PlanningData } from '../types/planning';
import { read, edit } from "../types/api";
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
            read<ResourceData[]>('ressources_vitales'),
            read<PlanningData[]>('routines_quotidiennes')
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

    const handleToggleTask = async (id: number) => {
        const task = planning.find((item) => item.id === id);
        if (!task) return;

        const isAlreadyCompleted = completedTaskIds.includes(id);

        // ✏️ Utilisation de 'ressource_vitale_id' (avec 2 's') et conversion en Number()
        const resourceId = task.ressource_vitale_id;
        const consumedQty = Number(task.quantite_consommee);

        if (resourceId && !isNaN(consumedQty) && consumedQty > 0) {
            const targetResource = resources.find((r) => Number(r.id) === Number(resourceId));

            if (targetResource) {
                const currentStock = Number(targetResource.quantite_restante);

                // Calcul : ajout si décoché, retrait si coché
                const newQuantity = isAlreadyCompleted
                    ? currentStock + consumedQty
                    : currentStock - consumedQty;

                const updatedQuantity = Math.max(0, Number(newQuantity.toFixed(3)));

                // A. Mise à jour instantanée du State React
                setResources((prevResources) =>
                    prevResources.map((resource) =>
                        Number(resource.id) === Number(resourceId)
                            ? { ...resource, quantite_restante: updatedQuantity }
                            : resource
                    )
                );

                // B. Persistance en BDD
                try {
                    await edit<ResourceData>(`ressources_vitales/${resourceId}`, {
                        quantite_restante: updatedQuantity,
                    });
                } catch (err) {
                    console.error("Erreur BDD lors de la mise à jour de la ressource :", err);
                }
            }
        }

        // Basculement de l'état de la tâche
        setCompletedTaskIds((prev) =>
            isAlreadyCompleted ? prev.filter((taskId) => taskId !== id) : [...prev, id]
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