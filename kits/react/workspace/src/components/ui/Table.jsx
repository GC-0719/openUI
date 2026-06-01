
export const Table = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div className="ou-table-wrapper" style={{ overflowX: 'auto', width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <table 
        className={`ou-table ${className}`} 
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left', ...style }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};
