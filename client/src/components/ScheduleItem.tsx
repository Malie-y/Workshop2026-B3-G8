import '../styles/ScheduleItem.css';
import type { ScheduleItemProps } from '../types/planning';

export default function ScheduleItem({ itemPlanning, isDone, onToggle }: ScheduleItemProps) {

  return (
    <div className={`schedule-item ${isDone ? 'is-done' : ''}`}>
      {/* 1. Heure */}
      <span className="schedule-time">{itemPlanning.heure_precise}</span>

      {/* 2. Bloc Icône */}
      <div className="schedule-icon-wrapper">
        
      </div>

      {/* 3. Titre */}
      <div className="schedule-details">
        <span className="schedule-description">{itemPlanning.description ? itemPlanning.description.split(' ')[0] : ''}</span>
      </div>

      {/* 4. Checkbox & Statut */}
      <label className="schedule-status-group">
        <input
            type="checkbox"
            checked={isDone}
            onChange={onToggle}
            className="schedule-checkbox"
          />
          <span className="schedule-status-label">
            {isDone ? 'FAIT' : 'À FAIRE'}
          </span>
      </label>
    </div>
  );
}