import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface AnimationEffectsProps {
  children: React.ReactNode;
  effect?: 'particles' | 'sparkles' | 'hearts' | 'stars' | 'none';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
  className?: string;
}

export const AnimationEffects: React.FC<AnimationEffectsProps> = ({
  children,
  effect = 'sparkles',
  intensity = 'medium',
  color = '#ec4899',
  className
}) => {
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: true });

  // Generate particles based on effect and intensity
  useEffect(() => {
    if (effect === 'none') return;

    const particleCount = intensity === 'low' ? 5 : intensity === 'medium' ? 10 : 20;
    const newParticles: ParticleProps[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: color,
        delay: Math.random() * 2
      });
    }

    setParticles(newParticles);
  }, [effect, intensity, color]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const particleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: 0
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const sparkleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: 0
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const heartVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      y: 0
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -20, -40],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  const starVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: 0
    },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Get animation variant based on effect
  const getVariant = () => {
    switch (effect) {
      case 'particles':
        return particleVariants;
      case 'sparkles':
        return sparkleVariants;
      case 'hearts':
        return heartVariants;
      case 'stars':
        return starVariants;
      default:
        return particleVariants;
    }
  };

  // Get particle shape based on effect
  const getParticleShape = (particle: ParticleProps) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: particle.color,
      borderRadius: effect === 'hearts' ? '50%' : effect === 'stars' ? '0%' : '50%',
      pointerEvents: 'none' as const,
      zIndex: 1
    };

    switch (effect) {
      case 'hearts':
        return (
          <div
            key={particle.x + particle.y}
            style={baseStyle}
            className="heart-shape"
          >
            ♥
          </div>
        );
      case 'stars':
        return (
          <div
            key={particle.x + particle.y}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        );
      case 'sparkles':
        return (
          <div
            key={particle.x + particle.y}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              transform: 'rotate(45deg)'
            }}
          />
        );
      default:
        return (
          <div
            key={particle.x + particle.y}
            style={baseStyle}
          />
        );
    }
  };

  if (effect === 'none') {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
      
      {/* Particles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, index) => (
          <motion.div
            key={`${particle.x}-${particle.y}-${index}`}
            variants={getVariant()}
            initial="hidden"
            animate="visible"
            style={{
              animationDelay: `${particle.delay}s`
            }}
          >
            {getParticleShape(particle)}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Specialized animation components
export const SparkleEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <AnimationEffects effect="sparkles" intensity="medium" className={className}>
    {children}
  </AnimationEffects>
);

export const HeartEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <AnimationEffects effect="hearts" intensity="low" className={className}>
    {children}
  </AnimationEffects>
);

export const StarEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <AnimationEffects effect="stars" intensity="medium" className={className}>
    {children}
  </AnimationEffects>
);

export const ParticleEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <AnimationEffects effect="particles" intensity="high" className={className}>
    {children}
  </AnimationEffects>
);

// Hover animation hook
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.3, ease: "easeOut" }
      });
    } else {
      controls.start({
        scale: 1,
        rotateY: 0,
        transition: { duration: 0.3, ease: "easeOut" }
      });
    }
  }, [isHovered, controls]);

  return {
    isHovered,
    setIsHovered,
    controls
  };
};

// Pulse animation hook
export const usePulseAnimation = (duration: number = 2) => {
  const controls = useAnimation();

  useEffect(() => {
    const pulse = () => {
      controls.start({
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
        transition: { duration, ease: "easeInOut" }
      });
    };

    const interval = setInterval(pulse, duration * 1000);
    return () => clearInterval(interval);
  }, [controls, duration]);

  return controls;
};

// Floating animation hook
export const useFloatingAnimation = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  return controls;
};
