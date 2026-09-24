// URL de base de l'API Laravel
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

/**
 * Fonction générique pour envoyer une requête GET pour récupérer des données
 */
export async function read<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
        const erreur = await res.json().catch(() => null);
        throw new Error(erreur?.message ?? `Erreur API ${res.status}`);
    }

    return res.json();
}

/**
 * Fonction générique pour envoyer une requête PUT/PATCH et modifier une donnée
 */
export async function edit<T>(endpoint: string, payload: Partial<T>): Promise<T> {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors de la modification de ${endpoint}`);
  }

  return response.json();
}