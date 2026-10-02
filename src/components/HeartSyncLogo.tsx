import React from 'react';

interface HeartSyncLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textSize?: string;
}

const HeartSyncLogo: React.FC<HeartSyncLogoProps> = ({
  size = 40,
  showText = true,
  className = '',
  textSize = 'text-xl',
}) => {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HeartSync logo"
        role="img"
      >
        <defs>
          <linearGradient id={`marble-main-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8425A" />
            <stop offset="18%" stopColor="#C41E3A" />
            <stop offset="32%" stopColor="#E06070" />
            <stop offset="45%" stopColor="#8B1228" />
            <stop offset="58%" stopColor="#D4354D" />
            <stop offset="72%" stopColor="#F0A0A8" />
            <stop offset="85%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#8B1228" />
          </linearGradient>
          <linearGradient id={`marble-overlay-${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`marble-glow-${uniqueId}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FF8090" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#C41E3A" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#8B1228" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`lip-upper-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E53E50" />
            <stop offset="40%" stopColor="#C41E3A" />
            <stop offset="100%" stopColor="#A01830" />
          </linearGradient>
          <linearGradient id={`lip-lower-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B81C32" />
            <stop offset="50%" stopColor="#9B1428" />
            <stop offset="100%" stopColor="#7A0E1E" />
          </linearGradient>
          <linearGradient id={`lip-shine-${uniqueId}`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`heartClip-${uniqueId}`}>
            <path d="M60 100 C22 72 0 48 0 28 C0 11 12 0 28 0 C40 0 50 7 60 18 C70 7 80 0 92 0 C108 0 120 11 120 28 C120 48 98 72 60 100Z" />
          </clipPath>
        </defs>

        <g clipPath={`url(#heartClip-${uniqueId})`}>
          <path
            d="M60 100 C22 72 0 48 0 28 C0 11 12 0 28 0 C40 0 50 7 60 18 C70 7 80 0 92 0 C108 0 120 11 120 28 C120 48 98 72 60 100Z"
            fill={`url(#marble-main-${uniqueId})`}
          />
          <path
            d="M60 100 C22 72 0 48 0 28 C0 11 12 0 28 0 C40 0 50 7 60 18 C70 7 80 0 92 0 C108 0 120 11 120 28 C120 48 98 72 60 100Z"
            fill={`url(#marble-overlay-${uniqueId})`}
          />
          <path
            d="M60 100 C22 72 0 48 0 28 C0 11 12 0 28 0 C40 0 50 7 60 18 C70 7 80 0 92 0 C108 0 120 11 120 28 C120 48 98 72 60 100Z"
            fill={`url(#marble-glow-${uniqueId})`}
          />

          <path d="M22 16 Q36 52 30 80" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M38 10 Q44 40 40 65" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M82 8 Q72 35 78 62" stroke="rgba(255,255,255,0.22)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M95 18 Q88 42 92 68" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M55 22 Q58 38 52 58" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" />
          <path d="M15 40 Q35 50 25 75" stroke="rgba(140,20,40,0.25)" strokeWidth="1.5" fill="none" />
          <path d="M100 30 Q85 48 95 70" stroke="rgba(140,20,40,0.2)" strokeWidth="1" fill="none" />
        </g>

        <path
          d="M60 100 C22 72 0 48 0 28 C0 11 12 0 28 0 C40 0 50 7 60 18 C70 7 80 0 92 0 C108 0 120 11 120 28 C120 48 98 72 60 100Z"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        <g transform="translate(60,48)">
          <path
            d="M-28 0 Q-18,-14 -4,-5 Q0,-8 4,-5 Q18,-14 28,0"
            fill={`url(#lip-upper-${uniqueId})`}
            stroke="#8B1228"
            strokeWidth="0.6"
          />
          <path
            d="M-28 0 Q-18,14 -4,5 Q0,8 4,5 Q18,14 28,0"
            fill={`url(#lip-lower-${uniqueId})`}
            stroke="#8B1228"
            strokeWidth="0.6"
          />
          <ellipse cx="0" cy="-6" rx="10" ry="3" fill={`url(#lip-shine-${uniqueId})`} />
          <rect x="-14" y="-3" width="28" height="6" rx="1.5" fill="white" opacity="0.93" />
          <line x1="-7" y1="-3" x2="-7" y2="3" stroke="#E8E8E8" strokeWidth="0.35" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#E8E8E8" strokeWidth="0.35" />
          <line x1="7" y1="-3" x2="7" y2="3" stroke="#E8E8E8" strokeWidth="0.35" />
        </g>

        <g>
          <line x1="12" y1="12" x2="108" y2="88" stroke="#1A1A1A" strokeWidth="3.2" strokeLinecap="round" />
          <polygon points="108,88 96,80 100,92" fill="#1A1A1A" />
          <line x1="12" y1="12" x2="5" y2="5" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="3" y2="11" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="11" y2="3" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
      {showText && (
        <span className={`${textSize} font-extrabold tracking-tight select-none`}>
          <span className="text-black">Heart</span>
          <span className="text-heartsync">sync</span>
        </span>
      )}
    </div>
  );
};

export default HeartSyncLogo;
