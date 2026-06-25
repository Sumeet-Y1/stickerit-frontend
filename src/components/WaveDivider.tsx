interface WaveDividerProps {
  fromColor: string;
  toColor: string;
  flip?: boolean;
}

export default function WaveDivider({ fromColor, toColor, flip = false }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-16 w-full overflow-hidden"
      style={{ background: toColor }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? 'rotate-180' : ''}`}
      >
        <path
          d="M0,64 C160,16 320,16 480,56 C640,96 800,120 960,72 C1120,24 1280,24 1440,64 L1440,120 L0,120 Z"
          fill={fromColor}
        />
      </svg>
    </div>
  );
}
