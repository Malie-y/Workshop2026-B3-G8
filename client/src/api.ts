// URL de base de l'API Laravel (définie dans client/.env ou docker-compose.yml)
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// GET /api/{chemin} -> JSON
export async function lire<T>(chemin: string): Promise<T> {
    const res = await fetch(`${API_URL}/${chemin}`, {
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
        const erreur = await res.json().catch(() => null);
        throw new Error(erreur?.message ?? `Erreur API ${res.status}`);
    }

    return res.json();
}

// Ligne de la table ressources_vitales
// Les colonnes DECIMAL arrivent en texte ("1435.00") : utiliser Number()
export interface RessourceVitale {
    id: number;
    nom: string;
    categorie: 'eau' | 'nourriture' | 'sommeil';
    quantite_restante: string;
    quantite_max: string;
    unite: string;
    couleur_led_associee: string;
}
