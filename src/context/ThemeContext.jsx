import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'openui-theme-overrides';
const STYLE_ID = 'openui-theme-override';
const COMP_STYLE_ID = 'openui-component-override';

export const ThemeProvider = ({ children }) => {
  const [cssVars, setCssVars] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });

  const [componentCSS, setComponentCSS] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cssVars));
    let el = document.getElementById(STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = STYLE_ID; document.head.appendChild(el); }
    const rules = Object.entries(cssVars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    el.textContent = rules ? `:root {\n${rules}\n}` : '';
  }, [cssVars]);

  useEffect(() => {
    let el = document.getElementById(COMP_STYLE_ID);
    if (!el) { el = document.createElement('style'); el.id = COMP_STYLE_ID; document.head.appendChild(el); }
    el.textContent = Object.entries(componentCSS)
      .map(([sel, props]) => `${sel} { ${props} }`)
      .join('\n');
  }, [componentCSS]);

  const applyChanges = ({ cssVars: vars = {}, componentCSS: css = {} }) => {
    if (Object.keys(vars).length) setCssVars(prev => ({ ...prev, ...vars }));
    if (Object.keys(css).length) setComponentCSS(prev => ({ ...prev, ...css }));
  };

  const resetTheme = () => {
    setCssVars({});
    setComponentCSS({});
  };

  return (
    <ThemeContext.Provider value={{ cssVars, componentCSS, applyChanges, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
