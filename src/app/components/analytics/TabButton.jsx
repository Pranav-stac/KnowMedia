const TabButton = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 -mb-px
        ${isActive 
          ? 'text-[var(--foreground)] border-b-2 border-[var(--primary)]' 
          : 'text-[var(--muted)] hover:text-[var(--foreground)] border-b-2 border-transparent'
        }
        transition-colors
      `}
    >
      {children}
    </button>
  );
};

export default TabButton; 