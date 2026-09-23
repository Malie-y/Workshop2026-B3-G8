import { useState } from 'react';
// import './ScheduleItem.css';

export default function ScheduleItem() {
  // État local pour cocher/décocher la tâche (simulant le champ actif/fait)
  const [isDone, setIsDone] = useState(true);

  // Exemple de données basées sur votre entrée BDD:
  // (4, 3, NULL, 1, '10:30:00', 'Boire - LED bleue (eau)', TRUE)
  const itemData = {
    heure: '10:30',
    titre: 'Hydratation',
    description: 'Boire - LED bleue (eau)',
  };

  return (
    <div className={`schedule-item ${isDone ? 'is-done' : ''}`}>
      {/* 1. Heure */}
      <span className="schedule-time">{itemData.heure}</span>

      {/* 2. Bloc Icône */}
      <div className="schedule-icon-wrapper">
        
      </div>

      {/* 3. Titre & Description */}
      <div className="schedule-details">
        <h4 className="schedule-title">{itemData.titre}</h4>
        <span className="schedule-description">{itemData.description}</span>
      </div>

      {/* 4. Checkbox & Statut */}
      <label className="schedule-status-group">
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => setIsDone(e.target.checked)}
          className="schedule-checkbox"
        />
        <span className="schedule-status-label">
          {isDone ? 'FAIT' : 'À FAIRE'}
        </span>
      </label>
    </div>
  );
}