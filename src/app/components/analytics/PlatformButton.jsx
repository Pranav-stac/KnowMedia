    const PlatformButton = ({ platform, isActive, onClick, children }) => {
  const getBackgroundColor = () => {
    if (isActive) {
      switch (platform) {
        case 'linkedin': return 'bg-[#0077B5]';
        case 'instagram': return 'bg-[#E4405F]';
        default: return 'bg-[var(--primary)]';
      }
    }
    return 'bg-[var(--background)]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg transition-all
        ${getBackgroundColor()}
        ${isActive ? 'text-white' : 'text-[var(--muted)]'}
        hover:bg-opacity-90
        flex items-center gap-2
      `}
    >
      {children}
    </button>
  );
};

export default PlatformButton; 