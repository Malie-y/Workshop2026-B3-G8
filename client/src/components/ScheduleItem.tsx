import { useState } from 'react';
import '../styles/ScheduleItem.css';
import type { PlanningData } from '../types/planning';

interface PlanningCardProps {
  item: PlanningData;
}

export default function ScheduleItem({ item }: PlanningCardProps) {
  // État local pour cocher/décocher la tâche (simulant le champ actif/fait)
  const [isDone, setIsDone] = useState(false);

  return (
    <div className={`schedule-item ${isDone ? 'is-done' : ''}`}>
      {/* 1. Heure */}
      <span className="schedule-time">{item.heure_precise}</span>

      {/* 2. Bloc Icône */}
      <div className="schedule-icon-wrapper">
        
      </div>

      {/* 3. Titre & Description */}
      <div className="schedule-details">
        <span className="schedule-description">{item.description ? item.description.split(' ')[0] : ''}</span>
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