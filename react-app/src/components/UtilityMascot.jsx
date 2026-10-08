import { useId } from 'react';

const characterPalettes = {
  electricity: { shell: ['#54e5df', '#148b9b'], glow: '#ffe47a', cheek: '#ff9b83', mark: 'bolt' },
  water: { shell: ['#9beaff', '#3989dc'], glow: '#e1fbff', cheek: '#ff9bba', mark: 'drop' },
  internet: { shell: ['#d5a5ff', '#7753d5'], glow: '#fff1a3', cheek: '#ff9ab7', mark: 'signal' },
};

export const UtilityMascot = ({ kind = 'electricity', className = '' }) => {
  const id = useId();
  const palette = characterPalettes[kind] || characterPalettes.electricity;

  return (
    <svg className={`utility-mascot ${className}`} data-kind={kind} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={palette.shell[0]} />
          <stop offset="1" stopColor={palette.shell[1]} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="106" rx="28" ry="5" fill="#071321" opacity=".16" />
      <g className="utility-mascot-motion">
        <path className="utility-mascot-fin utility-mascot-fin-left" d="M35 66C18 54 15 71 22 81c4 6 11 8 19 5z" fill={`url(#${id}-body)`} />
        <path className="utility-mascot-fin utility-mascot-fin-right" d="M85 66c17-12 20 5 13 15-4 6-11 8-19 5z" fill={`url(#${id}-body)`} />
        <path d="M43 91q-7 13 2 13 8 0 9-9m22-4q7 13-2 13-8 0-9-9" fill="none" stroke={palette.shell[1]} strokeLinecap="round" strokeWidth="7" />
        <path d="M31 51c0-17 12-29 29-29s29 12 29 29v18c0 18-12 30-29 30S31 87 31 69z" fill={`url(#${id}-body)`} />
        <path d="M39 39q7-12 19-11" fill="none" stroke={`url(#${id}-shine)`} strokeLinecap="round" strokeWidth="5" opacity=".7" />
        <ellipse cx="49" cy="60" rx="3.6" ry="5" fill="#132942" />
        <ellipse cx="71" cy="60" rx="3.6" ry="5" fill="#132942" />
        <circle cx="48" cy="58.5" r="1.3" fill="#fff" />
        <circle cx="70" cy="58.5" r="1.3" fill="#fff" />
        <ellipse cx="40" cy="70" rx="5" ry="2.6" fill={palette.cheek} opacity=".78" />
        <ellipse cx="80" cy="70" rx="5" ry="2.6" fill={palette.cheek} opacity=".78" />
        <path d="M54 70q6 8 12 0" fill="none" stroke="#17324a" strokeLinecap="round" strokeWidth="2.8" />
        {palette.mark === 'bolt' && <path d="m63 72-10 12h8l-3 12 12-16h-8z" fill={palette.glow} stroke="#fff3be" strokeLinejoin="round" strokeWidth="1.5" />}
        {palette.mark === 'drop' && <path d="M60 74c-2 5-8 10-8 15a8 8 0 0 0 16 0c0-5-6-10-8-15z" fill={palette.glow} stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" />}
        {palette.mark === 'signal' && <g fill="none" stroke={palette.glow} strokeLinecap="round" strokeWidth="3"><path d="M53 83q7-7 14 0" /><path d="M49 78q11-11 22 0" /><circle cx="60" cy="89" r="1.8" fill={palette.glow} stroke="none" /></g>}
        <circle className="utility-mascot-spark" cx="93" cy="31" r="5" fill={palette.glow} />
        <path className="utility-mascot-spark" d="m25 39 2-5 2 5 5 2-5 2-2 5-2-5-5-2z" fill="#fff" />
      </g>
    </svg>
  );
};
