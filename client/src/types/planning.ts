export interface PlanningData {
    id: number;
    journee_id: number;                  
    matos_id: number;            
    plante_id: number;    
    resource_vitale_id: number;
    heure_precise: string,       
    description: string;
    quantite_consommee: number;
    actif: boolean
}