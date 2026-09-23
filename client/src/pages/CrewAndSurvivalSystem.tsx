import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResourceCard from "../components/ResourceCard";
import '../styles/CrewAndSurvivalSystem.css'
import type { ResourceData } from '../types/resource';
import { lire } from "../types/api";

function CrewAndSurvivalSystem() {
    const [resources, setResources] = useState<ResourceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // lire() s'occupe de rajouter l'URL de base et de vérifier res.ok
                const data = await lire<ResourceData[]>('ressources_vitales');
                setResources(data);
            } catch (err: any) {
                setError(err.message || 'Impossible de charger les ressources.');
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    if (loading) return <div className="loading">Chargement des données de survie...</div>;
    if (error) return <div className="error-message">Erreur : {error}</div>;

    return (
        <>
            <Navbar />
            <section className="resources">
                <p>Ressources critiques</p>
                <article>
                    {resources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))
                    }
                </article>
            </section>
        </>
    )
}

export default CrewAndSurvivalSystem;