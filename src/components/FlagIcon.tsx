import React from 'react';

interface FlagIconProps {
  lang: 'zh' | 'en';
  size?: number;
  className?: string;
}

/**
 * Renders a flag image for the given language.
 * Uses SVG image files from /public/flags/ to ensure cross-platform
 * compatibility (Windows Chrome does not render flag emojis).
 */
const FlagIcon: React.FC<FlagIconProps> = ({ lang, size = 18, className = '' }) => {
  const src = lang === 'zh' ? '/flags/hk.svg' : '/flags/gb.svg';
  const alt = lang === 'zh' ? '香港區旗' : 'UK Flag';
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={Math.round(size * 0.67)}
      className={`inline-block rounded-sm ${className}`}
      style={{ objectFit: 'cover', verticalAlign: 'middle' }}
    />
  );
};

export default FlagIcon;
