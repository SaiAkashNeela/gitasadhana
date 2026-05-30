import React from "react";
import ChakraLogo from "./ChakraLogo";
import LotusLogo from "./LotusLogo";
import OmLogo from "./OmLogo";

interface GitaSadhanaLogoProps {
  variant?: "chakra" | "lotus" | "om" | "minimal";
  size?: number;
  withText?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Main Gita Sadhana Logo Component
 * 
 * Three spiritual variants to choose from:
 * - Chakra: 7 energy centers rotating in sacred harmony
 * - Lotus: Symbol of spiritual purity and enlightenment
 * - Om: The primordial sound of the universe
 * - Minimal: Clean, simple sacred geometry
 */
export function GitaSadhanaLogo({
  variant = "chakra",
  size = 200,
  withText = false,
  animated = true,
  className = "",
}: GitaSadhanaLogoProps) {
  const renderLogo = () => {
    switch (variant) {
      case "lotus":
        return <LotusLogo size={size} animated={animated} />;
      case "om":
        return <OmLogo size={size} animated={animated} />;
      case "chakra":
        return <ChakraLogo size={size} animated={animated} />;
      case "minimal":
        return <MinimalLogo size={size} animated={animated} />;
      default:
        return <ChakraLogo size={size} animated={animated} />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {renderLogo()}
      {withText && (
        <div className="text-center">
          <h1 className="font-serif text-2xl text-foreground font-bold">
            Gita Sadhana
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Sacred Verses, Spiritual Journey
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal Logo - Clean geometric design
 * Perfect for app headers, favicons, and small spaces
 */
function MinimalLogo({
  size = 200,
  animated = false,
}: {
  size: number;
  animated: boolean;
}) {
  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <linearGradient id="minimalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C27B0" />
            <stop offset="100%" stopColor="#6A1B9A" />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="url(#minimalGrad)" strokeWidth="2" />

        {/* 4 petals (simplified lotus) */}
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const x = 100 + 50 * Math.cos(angle);
          const y = 100 + 50 * Math.sin(angle);

          return (
            <ellipse
              key={`petal-${i}`}
              cx={x}
              cy={y}
              rx="15"
              ry="25"
              fill="url(#minimalGrad)"
              opacity="0.6"
              transform={`rotate(${(angle * 180) / Math.PI} ${x} ${y})`}
            />
          );
        })}

        {/* Center circle */}
        <circle cx="100" cy="100" r="20" fill="url(#minimalGrad)" opacity="0.8" />

        {/* Center dot */}
        <circle cx="100" cy="100" r="8" fill="#FFD700" />
      </svg>
    </div>
  );
}

/**
 * Logo Loading State - Animated spinner with spiritual vibe
 */
export function GitaSadhanaLogoLoader({
  size = 100,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C27B0" />
            <stop offset="100%" stopColor="#6A1B9A" />
          </linearGradient>

          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              .spinner {
                animation: spin 3s linear infinite;
                transform-origin: 50px 50px;
              }
              .pulser {
                animation: pulse 2s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Spinning rings */}
        <circle
          className="spinner"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#loaderGrad)"
          strokeWidth="2"
          opacity="0.8"
        />

        <circle
          className="spinner"
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="url(#loaderGrad)"
          strokeWidth="2"
          opacity="0.6"
          style={{ animationDirection: "reverse" }}
        />

        {/* Pulsing center */}
        <circle className="pulser" cx="50" cy="50" r="8" fill="url(#loaderGrad)" />
      </svg>
    </div>
  );
}

/**
 * Export all logo components for easy access
 */
export { ChakraLogo } from "./ChakraLogo";
export { LotusLogo } from "./LotusLogo";
export { OmLogo } from "./OmLogo";

export default GitaSadhanaLogo;
