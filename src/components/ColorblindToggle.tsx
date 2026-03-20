import { useTheme } from '../context/ThemeContext';

export function ColorblindToggle() {
  const { colorblindMode, toggleColorblindMode } = useTheme();

  return (
    <button
      onClick={toggleColorblindMode}
      className={`relative print-hide p-2 rounded-lg transition-colors ${
        colorblindMode
          ? 'bg-yellow-500/30 hover:bg-yellow-500/40'
          : 'bg-white/10 hover:bg-white/20'
      }`}
      aria-label={colorblindMode ? 'Disable colorblind mode' : 'Enable colorblind mode'}
      title={colorblindMode ? 'Colorblind mode on' : 'Colorblind mode off'}
    >
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {colorblindMode ? (
          // Eye with checkmark - colorblind mode active
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        ) : (
          // Eye icon - colorblind mode inactive
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        )}
      </svg>
      {colorblindMode && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-fountain-dark" />
      )}
    </button>
  );
}
