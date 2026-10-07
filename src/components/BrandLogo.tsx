import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  textClassName?: string;
  variant?: 'dark' | 'light' | 'auto';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textClassName = '',
  variant = 'auto'
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 28;
      case 'md': return 36;
      case 'lg': return 44;
      case 'xl': return 56;
      default: return 36;
    }
  };

  const dim = getDimension();

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      <img
        src="/logo.png"
        alt="AkoFinanced It Logo"
        width={dim}
        height={dim}
        style={{ width: `${dim}px`, height: `${dim}px` }}
        className="rounded-[10px] sm:rounded-[12px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
        loading="eager"
        decoding="async"
      />

      {showText && (
        <div className={`flex items-center gap-0.5 font-extrabold tracking-tight ${textClassName}`}>
          <span className={variant === 'dark' ? 'text-white' : 'text-[#0B0B0F]'}>AkoFinanced</span>
          <span className="text-[#2D62FF]">It</span>
        </div>
      )}
    </div>
  );
};

