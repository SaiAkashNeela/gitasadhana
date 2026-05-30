import React, { useState, useEffect } from "react";

interface ChakraLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * ChakraLogo Component
 * A beautiful, spiritually-inspired logo featuring the 7 chakras
 * in a sacred geometry pattern. Pure SVG code, no images.
 * Represents the spiritual journey through the Gita.
 *
 * Chakra Colors (from bottom to top):
 * 1. Root (Muladhara): Red - Stability, Foundation
 * 2. Sacral (Svadhisthana): Orange - Creativity, Passion
 * 3. Solar Plexus (Manipura): Yellow - Power, Will
 * 4. Heart (Anahata): Green - Love, Compassion
 * 5. Throat (Vishuddha): Blue - Truth, Communication
 * 6. Third Eye (Ajna): Indigo - Intuition, Wisdom
 * 7. Crown (Sahasrara): Violet - Spirituality, Connection
 */
export function ChakraLogo({
  size = 200,
  animated = true,
  className = "",
}: ChakraLogoProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, [animated]);

  const chakras = [
    { radius: 20, color: "#E74C3C", label: "Root" }, // Red - Muladhara
    { radius: 35, color: "#E67E22", label: "Sacral" }, // Orange - Svadhisthana
    { radius: 50, color: "#F1C40F", label: "Solar Plexus" }, // Yellow - Manipura
    { radius: 65, color: "#27AE60", label: "Heart" }, // Green - Anahata
    { radius: 80, color: "#3498DB", label: "Throat" }, // Blue - Vishuddha
    { radius: 95, color: "#8E44AD", label: "Third Eye" }, // Indigo - Ajna
    { radius: 110, color: "#9B59B6", label: "Crown" }, // Violet - Sahasrara
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 240 240" className="drop-shadow-lg">
        {/* Outer decorative ring with Sanskrit mantra essence */}
        <defs>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>

          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(147, 112, 219, 0.2)" />
            <stop offset="100%" stopColor="rgba(147, 112, 219, 0)" />
          </radialGradient>

          <filter id="chakraGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="centerLightGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background glow */}
        <circle cx="120" cy="120" r="125" fill="url(#outerGlow)" />

        {/* Rotating chakra rings - outer to inner */}
        <g transform={`rotate(${rotation} 120 120)`}>
          {chakras.map((chakra, idx) => (
            <g key={`chakra-${idx}`}>
              {/* Chakra circle with petal effect */}
              <circle
                cx="120"
                cy="120"
                r={chakra.radius}
                fill="none"
                stroke={chakra.color}
                strokeWidth="2.5"
                opacity="0.7"
                filter="url(#chakraGlow)"
              />

              {/* Petals around chakra (simplified lotus petals) */}
              {Array.from({ length: 6 + idx }).map((_, petalIdx) => {
                const angle = (petalIdx / (6 + idx)) * Math.PI * 2;
                const petalX = 120 + chakra.radius * Math.cos(angle);
                const petalY = 120 + chakra.radius * Math.sin(angle);

                return (
                  <circle
                    key={`petal-${idx}-${petalIdx}`}
                    cx={petalX}
                    cy={petalY}
                    r="3"
                    fill={chakra.color}
                    opacity="0.6"
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* Counter-rotating inner elements for balance */}
        <g transform={`rotate(${-rotation * 0.7} 120 120)`}>
          {chakras.slice(0, 3).map((chakra, idx) => (
            <circle
              key={`inner-chakra-${idx}`}
              cx="120"
              cy="120"
              r={chakra.radius}
              fill="none"
              stroke={chakra.color}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4,4"
            />
          ))}
        </g>

        {/* Central Om symbol circle */}
        <circle
          cx="120"
          cy="120"
          r="18"
          fill={chakras[3].color}
          opacity="0.15"
          filter="url(#chakraGlow)"
        />

        {/* Center sacred dot (Bindu) */}
        <circle cx="120" cy="120" r="6" fill="#9B59B6" filter="url(#centerLightGlow)" />

        {/* Outer sacred geometry - triangle pointing up (Shiva) */}
        <polygon
          points="120,105 132,130 108,130"
          fill="none"
          stroke="#9B59B6"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Outer sacred geometry - triangle pointing down (Shakti) */}
        <polygon
          points="120,135 132,110 108,110"
          fill="none"
          stroke="#E74C3C"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Inner glow effect */}
        <circle cx="120" cy="120" r="115" fill="url(#innerGlow)" />

        {/* Top and bottom accent lines (representing spiritual flow) */}
        <line
          x1="120"
          y1="8"
          x2="120"
          y2="25"
          stroke="#9B59B6"
          strokeWidth="2"
          opacity="0.5"
          strokeLinecap="round"
        />
        <line
          x1="120"
          y1="215"
          x2="120"
          y2="232"
          stroke="#E74C3C"
          strokeWidth="2"
          opacity="0.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Simple Static Chakra Logo (non-animated version)
 * Use this for static contexts (headers, icons, etc.)
 */
export function ChakraLogoStatic({
  size = 200,
  className = "",
}: Omit<ChakraLogoProps, "animated">) {
  return <ChakraLogo size={size} animated={false} className={className} />;
}

export default ChakraLogo;
