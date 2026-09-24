export interface PlanningData {
    id: number;
    journee_id: number;                  
    matos_id: number;            
    plante_id: number;    
    ressource_vitale_id: number | null;
    heure_precise: string,       
    description: string;
    quantite_consommee: number;
    actif: boolean
}

// Pour la liste globale (AlertPlanning)
export interface AlertPlanningProps {
  itemPlanning: PlanningData[];
  completedTaskIds: number[];
  onValidateTask: (id: number) => void;
}

// Pour une carte individuelle (ScheduleItem)
export interface ScheduleItemProps {
  itemPlanning: PlanningData;
  isDone: boolean;
  onToggle: () => void;
}