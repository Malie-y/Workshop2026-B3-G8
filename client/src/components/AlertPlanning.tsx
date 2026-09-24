import { useState, useEffect } from 'react';
import type { AlertPlanningProps, PlanningData } from '../types/planning';
import '../styles/AlertPlanning.css';

export function AlertPlanning({ itemPlanning, completedTaskIds, onValidateTask }: AlertPlanningProps) {
  const [currentAction, setCurrentAction] = useState<PlanningData | null>(null);

  useEffect(() => {
    const updateNextAction = () => {
      if (!itemPlanning || itemPlanning.length === 0) return;

      const now = new Date();
      // Obtenir l'heure actuelle au format "HH:MM" (ex: "12:15")
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      // RECHERCHE DE LA PROCHAINE ACTION NON ENCORE VALIDÉE
      const next = itemPlanning.find(
        (item) => item.heure_precise >= currentTimeString && !completedTaskIds.includes(item.id)
      );

      // Si toutes les tâches de la journée sont passées, prendre la première de la journée
      setCurrentAction(next || itemPlanning[0]);
    };

    updateNextAction();
    // Mettre à jour l'heure toutes les minutes (60 000 ms)
    const interval = setInterval(updateNextAction, 60000);

    return () => clearInterval(interval);
  }, [itemPlanning, completedTaskIds]);

  if (!currentAction) return null;

  // VERIFICATION SI L'ACTION EST DEJA COCHEE
  const isCurrentActionDone = completedTaskIds.includes(currentAction.id);

  return (
    <div className={`alert-card ${
    currentAction.description.includes('sommeil')
        ? 'alert-card-sleep'
        : currentAction.description.includes('nourriture')
        ? 'alert-card-eat'
        : currentAction.description.includes('eau')
            ? 'alert-card-water'
            : ''
    }`}>
      {/* Colonne Gauche : Heure */}
      <div className="alert-info-block">
        <div className='alert-info-time'>
            <span className="alert-label">PROCHAINE ACTION</span>
            <span className="alert-time">{currentAction.heure_precise}</span>
        </div>
        {/* Icône */}
        <div className="alert-icon-wrapper"></div>
        {/* Détails de l'action */}
        <span className="alert-category">{currentAction.description.split(' ')[0]}</span>
      </div>

      {/* Boutons d'action */}
      <div className="alert-actions">
        <button
            className="btn-validate"
            onClick={() => onValidateTask(currentAction.id)}
        >
          {isCurrentActionDone ? '✓ Validé' : '✓ À Valider'}
        </button>
      </div>
    </div>
  );
}