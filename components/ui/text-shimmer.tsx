'use client';
import React, { useMemo, type JSX } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  brightness?: number; // New prop for brightness control
}

export function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
  brightness = 1.5, // Default increased brightness
}: TextShimmerProps) {
  const MotionComponent = motion(Component as keyof JSX.IntrinsicElements);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text',
        'text-transparent [--base-color:#fff] [--base-gradient-color:#fff]',
        '[--bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),rgba(255,255,255,0.9)_calc(50%-var(--spread-inner)),#fff_50%,rgba(255,255,255,0.9)_calc(50%+var(--spread-inner)),transparent_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        'dark:[--base-color:#000] dark:[--base-gradient-color:#fff] dark:[--bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),rgba(255,255,255,0.9)_calc(50%-var(--spread-inner)),#fff_50%,rgba(255,255,255,0.9)_calc(50%+var(--spread-inner)),transparent_calc(50%+var(--spread)))]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          '--spread-inner': `${dynamicSpread * 0.3}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
          filter: `brightness(${brightness})`,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}