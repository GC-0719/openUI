import { Check, Hammer } from 'lucide-react';
import { parsePlanChecklist } from '../../services/aiService';

const PlanChecklist = ({ planText, onBuild, building = false }) => {
  const items = parsePlanChecklist(planText);
  if (!items.length) return null;

  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="ai-plan-checklist">
      <div className="ai-plan-checklist-head">
        <Check size={12} style={{ color: '#34d399' }} />
        <span>Implementation checklist</span>
        <span className="ai-plan-checklist-count">{doneCount}/{items.length}</span>
      </div>
      <ul className="ai-plan-checklist-list">
        {items.map((item, i) => (
          <li key={i} className={item.done ? 'done' : ''}>
            <span className="ai-plan-check-box" aria-hidden>{item.done ? '☑' : '☐'}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ai-plan-build-btn"
        onClick={onBuild}
        disabled={building}
        title="Switch to Edit mode and implement this plan"
      >
        <Hammer size={13} />
        {building ? 'Building…' : 'Build this plan'}
      </button>
    </div>
  );
};

export default PlanChecklist;
