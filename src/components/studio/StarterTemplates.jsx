import { LayoutDashboard, LogIn, Settings2, ListTodo, Hammer } from 'lucide-react';
import { getStarterTemplates } from '../../data/starter-templates';

const ICONS = {
  dashboard: LayoutDashboard,
  auth: LogIn,
  settings: Settings2,
};

const StarterTemplates = ({ framework = 'react', onPlan, onBuild, disabled = false }) => {
  const templates = getStarterTemplates(framework);

  return (
    <div className="ai-starter-templates">
      <div className="ai-starter-head">
        <span>Starter templates</span>
        <span className="ai-starter-hint">Plan first, or build immediately</span>
      </div>
      <div className="ai-starter-grid">
        {templates.map(template => {
          const Icon = ICONS[template.id] ?? LayoutDashboard;
          return (
            <div key={template.id} className="ai-starter-card">
              <div className="ai-starter-card-icon">
                <Icon size={16} />
              </div>
              <div className="ai-starter-card-body">
                <span className="ai-starter-card-name">{template.name}</span>
                <span className="ai-starter-card-tagline">{template.tagline}</span>
              </div>
              <div className="ai-starter-card-actions">
                <button
                  type="button"
                  className="ai-starter-btn primary"
                  disabled={disabled}
                  title="Generate a plan with checklist, then build"
                  onClick={() => onPlan?.(template)}
                >
                  <ListTodo size={12} /> Plan
                </button>
                <button
                  type="button"
                  className="ai-starter-btn"
                  disabled={disabled}
                  title="Skip planning and implement in Edit mode"
                  onClick={() => onBuild?.(template)}
                >
                  <Hammer size={12} /> Build
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StarterTemplates;
