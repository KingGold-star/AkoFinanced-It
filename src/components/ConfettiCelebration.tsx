import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'ribbon' | 'star';
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltAngleSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
  decay: number;
  gravity: number;
  drag: number;
}

const CELEBRATION_COLORS = [
  '#2D62FF', // AkoFinanced Royal Brand Blue
  '#38BDF8', // Vivid Sky Blue
  '#00D2FF', // Electric Cyan
  '#10B981', // Emerald Success
  '#34D399', // Mint
  '#F59E0B', // Warm Amber Gold
  '#FBBF24', // Sun Gold
  '#8B5CF6', // Soft Violet
  '#EC4899', // Rose Pink
  '#FFFFFF'  // Shimmer White
];

interface ConfettiCelebrationProps {
  /** Optional custom duration in ms (default: 4500ms) */
  duration?: number;
  /** Trigger again when this key changes */
  triggerKey?: string | number;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  duration = 5000,
  triggerKey
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let particles: Particle[] = [];
      const timeouts: (ReturnType<typeof setTimeout>)[] = [];

      // Handle high-DPI retina screens
      const resizeCanvas = () => {
        try {
          if (!canvas) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        } catch {
          // ignore resize errors
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

    // Helper to spawn a gentle batch of particles from a specific origin
    const spawnOriginBatch = (
      originXRatio: number,
      originYRatio: number,
      count: number,
      config: {
        angleMin: number;
        angleMax: number;
        speedMin: number;
        speedMax: number;
        gravity?: number;
        shapes?: ('rect' | 'circle' | 'ribbon' | 'star')[];
      }
    ) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const originX = originXRatio * w;
      const originY = originYRatio * h;

      const shapes = config.shapes || ['rect', 'circle', 'ribbon', 'star'];

      for (let i = 0; i < count; i++) {
        const angle =
          (config.angleMin + Math.random() * (config.angleMax - config.angleMin)) *
          (Math.PI / 180);
        const speed =
          config.speedMin + Math.random() * (config.speedMax - config.speedMin);

        const color =
          CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size =
          shape === 'ribbon'
            ? 8 + Math.random() * 8
            : shape === 'star'
            ? 7 + Math.random() * 7
            : 5 + Math.random() * 6;

        particles.push({
          x: originX + (Math.random() - 0.5) * 30,
          y: originY + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color,
          shape,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltAngleSpeed: 0.05 + Math.random() * 0.08,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.04,
          alpha: 1,
          decay: 0.0025 + Math.random() * 0.0035, // Gentle slow fade
          gravity: config.gravity ?? 0.12 + Math.random() * 0.08,
          drag: 0.985 + Math.random() * 0.01 // Gentle air resistance
        });
      }
    };

    // Staggered launch sequence from DIFFERENT parts of the screen
    const triggerConfettiSequence = () => {
      // 1. Initial Left & Right Cannons (Shooting up & inwards softly)
      spawnOriginBatch(0.08, 0.75, 45, {
        angleMin: -75,
        angleMax: -25,
        speedMin: 8,
        speedMax: 15,
        gravity: 0.14
      });

      spawnOriginBatch(0.92, 0.75, 45, {
        angleMin: -155,
        angleMax: -105,
        speedMin: 8,
        speedMax: 15,
        gravity: 0.14
      });

      // 2. Top-Left & Top-Right gentle ceiling shower at 250ms
      timeouts.push(
        setTimeout(() => {
          spawnOriginBatch(0.18, -0.02, 30, {
            angleMin: 30,
            angleMax: 85,
            speedMin: 2,
            speedMax: 5,
            gravity: 0.09
          });

          spawnOriginBatch(0.82, -0.02, 30, {
            angleMin: 95,
            angleMax: 150,
            speedMin: 2,
            speedMax: 5,
            gravity: 0.09
          });
        }, 250)
      );

      // 3. Top-Center & Mid-Screen Gentle cascade at 600ms
      timeouts.push(
        setTimeout(() => {
          spawnOriginBatch(0.5, -0.02, 35, {
            angleMin: 45,
            angleMax: 135,
            speedMin: 2.5,
            speedMax: 6,
            gravity: 0.1
          });

          // Soft ambient corner puffs
          spawnOriginBatch(0.04, 0.45, 20, {
            angleMin: -45,
            angleMax: 35,
            speedMin: 4,
            speedMax: 8,
            gravity: 0.12
          });

          spawnOriginBatch(0.96, 0.45, 20, {
            angleMin: 145,
            angleMax: 225,
            speedMin: 4,
            speedMax: 8,
            gravity: 0.12
          });
        }, 600)
      );

      // 4. Final delicate sparkle flutter at 1100ms
      timeouts.push(
        setTimeout(() => {
          spawnOriginBatch(0.35, -0.02, 25, {
            angleMin: 50,
            angleMax: 110,
            speedMin: 1.5,
            speedMax: 4,
            gravity: 0.08,
            shapes: ['star', 'circle']
          });

          spawnOriginBatch(0.65, -0.02, 25, {
            angleMin: 70,
            angleMax: 130,
            speedMin: 1.5,
            speedMax: 4,
            gravity: 0.08,
            shapes: ['star', 'circle']
          });
        }, 1100)
      );
    };

    // Trigger initial celebration
    triggerConfettiSequence();

    // Render loop
    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx + Math.sin(p.wobble) * 0.4;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltAngleSpeed;
        p.wobble += p.wobbleSpeed;
        p.alpha -= p.decay;

        // Remove dead particles
        if (p.alpha <= 0 || p.y > h + 40 || p.x < -60 || p.x > w + 60) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(Math.cos(p.tiltAngle), 1); // 3D flipping illusion
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'ribbon') {
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
        } else if (p.shape === 'star') {
          // 4-point gleaming star
          ctx.beginPath();
          const r = p.size;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        } else {
          // Default rect confetti
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, (p.size * 2) / 3);
        }

        ctx.restore();
      }

      // Continue animation if particles remain
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      timeouts.forEach(clearTimeout);
    };
    } catch (err) {
      console.warn('[ConfettiCelebration notice]', err);
    }
  }, [triggerKey, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};
