import React, { useRef, useState } from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'accent' | 'gradient' | 'cyan-purple' | 'subtle';
  glowColor?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  className = '',
  variant = 'dark',
  glowColor,
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    buttonRef.current.style.setProperty('--mouse-x', `${x}px`);
    buttonRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Base styling per variant
  let variantStyles = 'bg-[#0B0B0F] text-white hover:shadow-lg hover:shadow-slate-900/20';
  if (variant === 'accent') {
    variantStyles = 'bg-[#2D62FF] text-white hover:shadow-lg hover:shadow-blue-600/30';
  } else if (variant === 'cyan-purple') {
    variantStyles = 'bg-gradient-to-r from-[#00C9A7] via-[#0089BA] to-[#845EC2] text-white hover:shadow-lg hover:shadow-cyan-500/30';
  } else if (variant === 'gradient') {
    variantStyles = 'bg-gradient-to-r from-[#2D62FF] to-[#7B2CBF] text-white hover:shadow-lg hover:shadow-indigo-500/30';
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`btn-glow group relative isolate overflow-hidden rounded-full font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 select-none ${variantStyles} ${className}`}
      {...props}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-full transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 90px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 70%)`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle Luminous Under-Glow Pill */}
      <span
        className="pointer-events-none absolute -inset-1 -z-10 rounded-full blur-md transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.6 : 0,
          background: glowColor || (variant === 'cyan-purple' ? 'linear-gradient(90deg, #00C9A7, #845EC2)' : variant === 'accent' ? 'rgba(45, 98, 255, 0.6)' : 'rgba(45, 98, 255, 0.4)'),
        }}
      />

      {/* Button Inner Content */}
      <span className="relative z-20 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
