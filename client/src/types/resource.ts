export interface ResourceData {
    id: number;
    nom: string;                  
    categorie: 'eau' | 'nourriture';             
    quantite_restante: number;    
    quantite_max: number;         
    unite: string;
    couleur_led_associee: string
}