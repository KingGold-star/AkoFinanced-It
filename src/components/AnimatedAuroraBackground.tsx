import React from 'react';

export const AnimatedAuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#FFFFFF] transition-colors duration-1000">
      
      {/* 1. Top Soft Lavender/Purple Ambient Halo */}
      <div
        className="absolute left-1/2 -translate-x-1/2 blur-[140px] sm:blur-[180px] pointer-events-none opacity-80 animate-pulse-slow"
        style={{
          top: '-120px',
          width: 'min(90vw, 1100px)',
          height: '650px',
          background: 'radial-gradient(ellipse at center, rgba(192, 132, 252, 0.4) 0%, rgba(168, 85, 247, 0.2) 45%, rgba(216, 180, 254, 0.08) 70%, rgba(255, 255, 255, 0) 85%)',
        }}
      />

      {/* 2. Mid/Lower Soft Sky-Blue & Cyan Diffuse Glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 blur-[150px] sm:blur-[190px] pointer-events-none opacity-85 animate-float"
        style={{
          top: '220px',
          width: 'min(95vw, 1200px)',
          height: '700px',
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.4) 0%, rgba(96, 165, 250, 0.25) 40%, rgba(147, 197, 253, 0.1) 70%, rgba(255, 255, 255, 0) 85%)',
        }}
      />

      {/* 3. Soft Side Spread Shadow (Left Violet Tint) */}
      <div
        className="absolute -left-32 blur-[160px] pointer-events-none opacity-50 animate-pulse-slow"
        style={{
          top: '100px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(192, 132, 252, 0.1) 50%, rgba(255, 255, 255, 0) 80%)',
        }}
      />

      {/* 4. Soft Side Spread Shadow (Right Mint/Cyan Tint) */}
      <div
        className="absolute -right-32 blur-[160px] pointer-events-none opacity-50 animate-float"
        style={{
          top: '300px',
          width: '650px',
          height: '650px',
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(45, 98, 255, 0.1) 50%, rgba(255, 255, 255, 0) 80%)',
        }}
      />

      {/* 5. Lower Page Soft Periwinkle Shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 blur-[160px] pointer-events-none opacity-60 animate-pulse-slow"
        style={{
          top: '800px',
          width: 'min(90vw, 1100px)',
          height: '650px',
          background: 'radial-gradient(ellipse at center, rgba(165, 180, 252, 0.35) 0%, rgba(192, 132, 252, 0.15) 45%, rgba(255, 255, 255, 0) 80%)',
        }}
      />

      {/* 6. Clean, visible premium geometric dot grid background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 7. Soft linear accent line mesh */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Subtle Noise / Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

    </div>
  );
};


