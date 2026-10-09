import React from 'react';
import { useStore } from '../context/StoreContext';

interface BrandLogoProps {
  className?: string;
  variant?: 'horizontal' | 'icon' | 'white' | 'stacked';
  height?: number;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'horizontal',
  height,
  showTagline = true
}) => {
  const { settings } = useStore();

  const effectiveHeight = height || settings.logoHeight || 42;

  // Check if logo is a preset or custom image
  const configuredLogo = settings.logoUrl?.trim() || '';

  // If a custom image URL (HTTP or data URL) is set
  if (configuredLogo !== '' && !configuredLogo.startsWith('preset:')) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={configuredLogo}
          alt={settings.storeName || 'PyNotes'}
          style={{ height: `${effectiveHeight}px` }}
          className={`object-contain max-w-full ${
            variant === 'white' ? 'bg-white/10 p-1 rounded-lg backdrop-blur-xs' : ''
          }`}
        />
      </div>
    );
  }

  // Preset resolution
  let effectiveVariant = variant;
  if (configuredLogo.startsWith('preset:') && variant !== 'white') {
    const preset = configuredLogo.replace('preset:', '') as 'horizontal' | 'stacked' | 'icon' | 'white';
    if (['horizontal', 'stacked', 'icon', 'white'].includes(preset)) {
      effectiveVariant = preset;
    }
  }

  // Brand colors from official PyNotes Brand Guidelines:
  // Primary Navy: #0B3561
  // Secondary Teal: #12A5B0
  // Support Ink Night: #071E38
  // Soft Mint Tint: #DDF3F4
  const navyColor = effectiveVariant === 'white' ? '#FFFFFF' : '#0B3561';
  const tealColor = effectiveVariant === 'white' ? '#DDF3F4' : '#12A5B0';
  const tagColor = effectiveVariant === 'white' ? '#CED7DF' : '#0B3561';

  // SVG Icon Component
  const renderIcon = (iconHeight: number) => (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: `${iconHeight}px`, width: 'auto' }}
      className="shrink-0 select-none"
      aria-hidden="true"
    >
      {/* 3 Sparks on top-left of open book */}
      <line x1="28" y1="36" x2="16" y2="40" stroke={tealColor} strokeWidth="5.5" strokeLinecap="round" />
      <line x1="36" y1="24" x2="30" y2="12" stroke={tealColor} strokeWidth="5.5" strokeLinecap="round" />
      <line x1="48" y1="20" x2="52" y2="8" stroke={tealColor} strokeWidth="5.5" strokeLinecap="round" />

      {/* Teal foundation curve strokes */}
      <path
        d="M 24 116 C 50 125, 78 126, 80 128 C 82 126, 110 125, 136 116"
        stroke={tealColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 32 122 C 55 130, 78 131, 80 133 C 82 131, 105 130, 128 122"
        stroke={tealColor}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Left Open Page */}
      <path
        d="M 24 48 C 24 48, 52 46, 78 56 L 78 116 C 52 108, 24 110, 24 110 Z"
        fill={effectiveVariant === 'white' ? 'transparent' : '#FFFFFF'}
        stroke={navyColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Right Open Page */}
      <path
        d="M 136 48 C 136 48, 108 46, 82 56 L 82 116 C 108 108, 136 110, 136 110 Z"
        fill={effectiveVariant === 'white' ? 'transparent' : '#FFFFFF'}
        stroke={navyColor}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Center Spine */}
      <path d="M 80 56 L 80 118" stroke={navyColor} strokeWidth="5" strokeLinecap="round" />

      {/* Left page: < / > code tag */}
      <path
        d="M 46 68 L 38 78 L 46 88"
        stroke={tealColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 54 89 L 60 67"
        stroke={tealColor}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 68 68 L 76 78 L 68 88"
        stroke={tealColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right page: Bookmark ribbon */}
      <path
        d="M 96 34 L 114 34 L 114 62 L 105 54 L 96 62 Z"
        fill={tealColor}
        stroke={navyColor}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Right page: handwritten lines */}
      <path d="M 92 72 L 114 72" stroke={navyColor} strokeWidth="5" strokeLinecap="round" />
      <path d="M 92 84 L 118 84" stroke={navyColor} strokeWidth="5" strokeLinecap="round" />
      <path d="M 92 96 L 110 96" stroke={navyColor} strokeWidth="5" strokeLinecap="round" />

      {/* Diagonal pencil drawing notes */}
      <g transform="translate(112, 38) rotate(32)">
        <rect x="0" y="0" width="13" height="42" rx="3" fill={navyColor} />
        <path d="M 0 42 L 6.5 56 L 13 42 Z" fill="#FFFFFF" stroke={navyColor} strokeWidth="3" />
        <path d="M 4 50 L 6.5 56 L 9 50 Z" fill={navyColor} />
        <rect x="0" y="0" width="13" height="8" rx="2" fill={tealColor} />
      </g>
    </svg>
  );

  // 1. Icon Only
  if (effectiveVariant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {renderIcon(effectiveHeight)}
      </div>
    );
  }

  // 2. Stacked Variant (Centered Icon on top of Wordmark)
  if (effectiveVariant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center justify-center text-center select-none ${className}`}>
        {renderIcon(effectiveHeight * 0.9)}
        <div className="flex flex-col items-center mt-1">
          <div className="flex items-baseline tracking-tight leading-none">
            <span
              style={{ color: navyColor, fontFamily: "'Nunito', sans-serif" }}
              className="text-2xl sm:text-3xl font-black italic tracking-tight"
            >
              Py
            </span>
            <span
              style={{ color: tealColor, fontFamily: "'Nunito', sans-serif" }}
              className="text-2xl sm:text-3xl font-black italic tracking-tight ml-0.5"
            >
              Notes
            </span>
          </div>
          <svg
            viewBox="0 0 140 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-28 -mt-0.5 mb-1"
            style={{ height: '6px' }}
          >
            <path
              d="M 2 8 C 45 4, 95 3, 138 9"
              stroke={tealColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
          {showTagline && (
            <div
              style={{ color: tagColor, letterSpacing: '0.22em', fontFamily: "'Montserrat', sans-serif" }}
              className="text-[8px] font-extrabold uppercase whitespace-nowrap"
            >
              LEARN &bull; WRITE &bull; GROW
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Horizontal Full Color or White (Default Brand Logo)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {renderIcon(effectiveHeight)}

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight leading-none">
          <span
            style={{ color: navyColor, fontFamily: "'Nunito', sans-serif" }}
            className="text-2xl sm:text-3xl font-black italic tracking-tight"
          >
            Py
          </span>
          <span
            style={{ color: tealColor, fontFamily: "'Nunito', sans-serif" }}
            className="text-2xl sm:text-3xl font-black italic tracking-tight ml-0.5"
          >
            Notes
          </span>
        </div>

        {/* Underline Swoosh */}
        <svg
          viewBox="0 0 140 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full -mt-0.5 mb-1"
          style={{ height: '7px' }}
        >
          <path
            d="M 2 8 C 45 4, 95 3, 138 9"
            stroke={tealColor}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Tagline: LEARN • WRITE • GROW */}
        {showTagline && (
          <div
            style={{ color: tagColor, letterSpacing: '0.22em', fontFamily: "'Montserrat', sans-serif" }}
            className="text-[8px] sm:text-[9.5px] font-extrabold uppercase whitespace-nowrap pl-0.5"
          >
            LEARN &bull; WRITE &bull; GROW
          </div>
        )}
      </div>
    </div>
  );
};
