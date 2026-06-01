import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Accordion = ({ items = [], className = '', style = {}, ...props }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className={`ou-accordion-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', ...style }} {...props}>
      {items.map((item, idx) => (
        <div key={idx} className={`ou-accordion ${openIndex === idx ? 'ou-accordion-open' : ''}`}>
          <div 
            className="ou-accordion-header" 
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{item.title}</span>
            <ChevronDown 
              size={16} 
              style={{ transition: 'transform 0.3s', transform: openIndex === idx ? 'rotate(180deg)' : 'none' }} 
            />
          </div>
          {openIndex === idx && (
            <div className="ou-accordion-content animate-fade-in" style={{ padding: '16px' }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
