// URL de base de l'API Laravel
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
