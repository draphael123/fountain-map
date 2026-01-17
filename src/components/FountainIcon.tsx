interface FountainIconProps {
  color?: string;
  size?: number;
  className?: string;
}

export function FountainIcon({ color = 'currentColor', size = 24, className = '' }: FountainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Center stem */}
      <path
        d="M16 28V14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left leaf/drop */}
      <path
        d="M16 14C16 14 12 10 12 6C12 3 14 2 16 2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right leaf/drop */}
      <path
        d="M16 14C16 14 20 10 20 6C20 3 18 2 16 2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left outer spray */}
      <path
        d="M16 18C16 18 8 14 6 8C5 5 7 3 9 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Right outer spray */}
      <path
        d="M16 18C16 18 24 14 26 8C27 5 25 3 23 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}



