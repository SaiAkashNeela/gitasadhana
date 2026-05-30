import React, { useState, useEffect } from "react";

interface OmLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
  hideGlow?: boolean;
}

/**
 * OmLogo Component
 * The sacred Sanskrit syllable Om (ॐ) - Aum
 * The primordial sound of the universe, representing the ultimate reality
 * 
 * Om Symbolism in the Bhagavad Gita:
 * - Chapter 8.13: "Uttering the one syllable 'Om,' the Brahman..."
 * - Represents past, present, and future all merged into one eternal present
 */
export function OmLogo({
  size = 200,
  animated = true,
  className = "",
  hideGlow = false,
}: OmLogoProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!animated) return;

    let direction = 1;
    const interval = setInterval(() => {
      setOpacity((prev) => {
        if (prev >= 1) direction = -1;
        if (prev <= 0.6) direction = 1;
        return prev + direction * 0.02;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 240 240">
        <defs>
          <radialGradient id="omGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(156, 39, 176, 0.3)" />
            <stop offset="100%" stopColor="rgba(156, 39, 176, 0)" />
          </radialGradient>

          <linearGradient id="omGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C27B0" />
            <stop offset="50%" stopColor="#7B1FA2" />
            <stop offset="100%" stopColor="#6A1B9A" />
          </linearGradient>

          <filter id="omShadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetblur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="omGlowFilter">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow circle */}
        {!hideGlow && (
          <circle
            cx="120"
            cy="120"
            r="115"
            fill="url(#omGlow)"
            opacity={opacity * 0.6}
          />
        )}

        {/* Outer circle (spiritual boundary) */}
        <circle
          cx="120"
          cy="120"
          r="105"
          fill="none"
          stroke="url(#omGradient)"
          strokeWidth="2"
          opacity={opacity}
          filter="url(#omGlowFilter)"
        />

        {/* Main Om Symbol (hand-crafted paths for authentic look) */}
        <g transform="translate(120, 120)">
          {/* The "3" curve - part of Om shape */}
          <path
            d="M -15 -20 Q -20 -15 -20 0 Q -20 15 -10 20"
            fill="none"
            stroke="url(#omGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity={opacity}
            filter="url(#omGlowFilter)"
          />

          {/* The "U" curve */}
          <path
            d="M 0 -25 Q 5 -15 5 0 Q 5 15 -5 20"
            fill="none"
            stroke="url(#omGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity={opacity}
            filter="url(#omGlowFilter)"
          />

          {/* The dot (Bindu) - represents the infinite */}
          <circle cx="15" cy="-18" r="5" fill="url(#omGradient)" opacity={opacity} />

          {/* The curve above (Chandra Bindu) - crescent moon */}
          <path
            d="M 12 -25 Q 18 -28 24 -25"
            fill="none"
            stroke="url(#omGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={opacity * 0.7}
          />

          {/* Decorative petals (8 petals of lotus around Om) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = 75 * Math.cos(angle);
            const y = 75 * Math.sin(angle);

            return (
              <circle
                key={`petal-${i}`}
                cx={x}
                cy={y}
                r="4"
                fill="url(#omGradient)"
                opacity={opacity * 0.5}
              />
            );
          })}
        </g>

        {/* Inner circle (spiritual center) */}
        <circle
          cx="120"
          cy="120"
          r="90"
          fill="none"
          stroke="url(#omGradient)"
          strokeWidth="1"
          opacity={opacity * 0.4}
          strokeDasharray="5,5"
        />

        {/* Accent lines (representing cosmic direction) */}
        <line
          x1="120"
          y1="15"
          x2="120"
          y2="30"
          stroke="url(#omGradient)"
          strokeWidth="2"
          opacity={opacity * 0.6}
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="210"
          x2="120"
          y2="225"
          stroke="url(#omGradient)"
          strokeWidth="2"
          opacity={opacity * 0.6}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Combined Spiritual Logo - displays multiple symbols
 */
export function SpiritualEmblem({
  size = 240,
  className = "",
  animate = true,
}: {
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 240 240">
        <defs>
          <radialGradient id="emblmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 193, 7, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 193, 7, 0)" />
          </radialGradient>
        </defs>

        {/* Outer glow */}
        <circle cx="120" cy="120" r="118" fill="url(#emblmGlow)" />

        {/* Outer border with sacred geometry */}
        <circle
          cx="120"
          cy="120"
          r="115"
          fill="none"
          stroke="#9C27B0"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* 4 triangles representing cosmic elements */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const centerX = 120 + 45 * Math.cos(angle);
          const centerY = 120 + 45 * Math.sin(angle);

          const colors = ["#E74C3C", "#F1C40F", "#27AE60", "#3498DB"];

          return (
            <circle
              key={`element-${i}`}
              cx={centerX}
              cy={centerY}
              r="8"
              fill={colors[i]}
              opacity="0.6"
            />
          );
        })}

        {/* Center sacred circle */}
        <circle cx="120" cy="120" r="35" fill="none" stroke="#9C27B0" strokeWidth="1.5" opacity="0.4" />
        <circle cx="120" cy="120" r="28" fill="none" stroke="#9C27B0" strokeWidth="1" opacity="0.3" />

        {/* Center dot (Bindu - representing infinity) */}
        <circle cx="120" cy="120" r="6" fill="#FFD700" />
        <circle cx="120" cy="120" r="4" fill="#9C27B0" />
      </svg>
    </div>
  );
}

export default OmLogo;
