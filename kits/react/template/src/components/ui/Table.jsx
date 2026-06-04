
export const Table = ({ children, caption, className = '', style = {}, ...props }) => {
  return (
    <div
      className="ou-table-wrapper"
      style={{ overflowX: 'auto', width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }}
    >
      <table
        className={`ou-table ${className}`.trim()}
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left', ...style }}
        {...props}
      >
        {caption && <caption style={{ captionSide: 'top', padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>{caption}</caption>}
        {children}
      </table>
    </div>
  );
};
