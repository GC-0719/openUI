import { Layers } from 'lucide-react';
import { componentsMeta } from '../../data/components-meta.js';

const ComponentPreview = ({ filePath, previewKey = 0, framework = 'react' }) => {
  if (!filePath) {
    return (
      <div className="studio-comp-preview-empty">
        <Layers size={28} opacity={0.3} />
        <span>Open a component file to see its preview</span>
      </div>
    );
  }

  const raw = filePath.split('/').pop().replace(/\.(jsx|js|tsx|ts)$/, '').replace(/\.component$/, '');

  const component = componentsMeta.find(
    c => c.id === raw.toLowerCase()
      || c.id === raw.toLowerCase() + 's'
      || c.name.toLowerCase() === raw.toLowerCase()
  );

  if (!component) {
    return (
      <div className="studio-comp-preview-empty">
        <Layers size={28} opacity={0.3} />
        <span>No preview available for <code>{raw}</code></span>
      </div>
    );
  }

  const src = framework === 'angular'
    ? `/preview/angular-app.html?preview=${encodeURIComponent(component.name)}&t=${previewKey}`
    : `/preview/kit-preview.html?preview=${encodeURIComponent(component.name)}#t=${previewKey}`;

  return (
    <iframe
      key={`${filePath}-${previewKey}`}
      src={src}
      className="studio-preview-frame"
      title={`${component.name} preview`}
    />
  );
};

export default ComponentPreview;
