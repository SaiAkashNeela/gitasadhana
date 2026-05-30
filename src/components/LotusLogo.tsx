import React, { useState, useEffect } from "react";

interface LotusLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
  variant?: "simple" | "detailed" | "minimal";
}

/**
 * LotusLogo Component
 * A graceful lotus flower - symbol of purity, enlightenment, and spiritual rebirth
 * Represents the journey through the Bhagavad Gita
 * 
 * Lotus Symbolism:
 * - Roots in mud: Worldly attachments
 * - Rising through water: Life's challenges
 * - Blooming above water: Spiritual awakening
 */
export function LotusLogo({
  size = 200,
  animated = true,
  className = "",
  variant = "detailed",
}: LotusLogoProps) {
  const [bloomScale, setBloomScale] = useState(0.8);

  useEffect(() => {
    if (!animated) return;

    let direction = 1;
    const interval = setInterval(() => {
      setBloomScale((prev) => {
        if (prev >= 1) direction = -1;
        if (prev <= 0.8) direction = 1;
        return prev + direction * 0.01;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [animated]);

  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg width={size} height={size} viewBox="0 0 200 200">
          <defs>
            <radialGradient id="lotusGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8F5E9" />
              <stop offset="100%" stopColor="#C8E6C9" />
            </radialGradient>
          </defs>

          {/* Stem */}
          <path
            d="M 100 200 Q 95 150 100 100"
            stroke="#4CAF50"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />

          {/* Petals - 8 petals for completeness */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const petalX = 100 + 35 * Math.cos(angle);
            const petalY = 100 + 35 * Math.sin(angle);

            return (
              <ellipse
                key={`petal-${i}`}
                cx={petalX}
                cy={petalY}
                rx="12"
                ry="22"
                fill="#FF69B4"
                opacity="0.8"
                transform={`rotate(${(angle * 180) / Math.PI} ${petalX} ${petalY})`}
              />
            );
          })}

          {/* Center */}
          <circle cx="100" cy="100" r="10" fill="#FFD700" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 240 280">
        <defs>
          <radialGradient id="petalGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255, 182, 193, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 105, 180, 0)" />
          </radialGradient>

          <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB6D9" />
            <stop offset="50%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#FF1493" />
          </linearGradient>

          <filter id="petalShadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* Mud/water base */}
        <ellipse cx="120" cy="240" rx="80" ry="25" fill="#8B7355" opacity="0.2" />

        {/* Stem */}
        <path
          d="M 120 240 Q 115 180 118 120"
          stroke="#2E7D32"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Lotus leaves */}
        <ellipse
          cx="70"
          cy="190"
          rx="35"
          ry="45"
          fill="#4CAF50"
          opacity="0.4"
          transform="rotate(-30 70 190)"
        />
        <ellipse
          cx="170"
          cy="190"
          rx="35"
          ry="45"
          fill="#4CAF50"
          opacity="0.4"
          transform="rotate(30 170 190)"
        />

        {/* Outer petals (8) - detailed with shading */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const outerX = 120 + 55 * Math.cos(angle);
          const outerY = 120 + 55 * Math.sin(angle);

          return (
            <g key={`outer-petal-${i}`}>
              <ellipse
                cx={outerX}
                cy={outerY}
                rx="16"
                ry="28"
                fill="url(#petalGrad)"
                opacity={0.9 * bloomScale}
                transform={`rotate(${(angle * 180) / Math.PI} ${outerX} ${outerY})`}
                filter="url(#petalShadow)"
              />
            </g>
          );
        })}

        {/* Middle petals (8) - slightly smaller */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const midX = 120 + 35 * Math.cos(angle);
          const midY = 120 + 35 * Math.sin(angle);

          return (
            <ellipse
              key={`mid-petal-${i}`}
              cx={midX}
              cy={midY}
              rx="13"
              ry="24"
              fill="#FF69B4"
              opacity={0.85 * bloomScale}
              transform={`rotate(${(angle * 180) / Math.PI} ${midX} ${midY})`}
            />
          );
        })}

        {/* Inner petals (8) - smallest */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const innerX = 120 + 18 * Math.cos(angle);
          const innerY = 120 + 18 * Math.sin(angle);

          return (
            <ellipse
              key={`inner-petal-${i}`}
              cx={innerX}
              cy={innerY}
              rx="10"
              ry="18"
              fill="#FFE4E1"
              opacity={0.9 * bloomScale}
              transform={`rotate(${(angle * 180) / Math.PI} ${innerX} ${innerY})`}
            />
          );
        })}

        {/* Center stamen (golden) */}
        <circle cx="120" cy="120" r="14" fill="#FFD700" />
        <circle cx="120" cy="120" r="12" fill="#FFC700" />

        {/* Center dot */}
        <circle cx="120" cy="120" r="5" fill="#FF8C00" filter="url(#petalShadow)" />

        {/* Petal glow */}
        <circle
          cx="120"
          cy="120"
          r="65"
          fill="url(#petalGlow)"
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}

export default LotusLogo;
