/**
 * LOGO USAGE EXAMPLES
 * 
 * This file demonstrates how to use the spiritual logos throughout your app
 */

// ============================================================================
// 1. IMPORTING LOGOS
// ============================================================================

// Import individual logos
import ChakraLogo, { ChakraLogoStatic } from "@/components/ChakraLogo";
import LotusLogo from "@/components/LotusLogo";
import OmLogo from "@/components/OmLogo";

// Import main logo component
import GitaSadhanaLogo, { GitaSadhanaLogoLoader } from "@/components/GitaSadhanaLogo";

// ============================================================================
// 2. USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: App Header/Navigation
 */
export function HeaderWithLogo() {
  return (
    <header className="bg-gradient-dawn border-b border-primary/10">
      <div className="flex items-center gap-4 px-5 py-3">
        {/* Use static chakra logo in header */}
        <ChakraLogoStatic size={48} />
        <div>
          <h1 className="font-serif text-xl text-foreground">Gita Sadhana</h1>
          <p className="text-xs text-muted-foreground">Spiritual Journey</p>
        </div>
      </div>
    </header>
  );
}

/**
 * EXAMPLE 2: Landing/Onboarding Screen
 */
export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      {/* Use animated chakra logo */}
      <GitaSadhanaLogo
        variant="chakra"
        size={300}
        animated={true}
        withText={true}
      />
      <p className="text-center text-muted-foreground max-w-sm">
        Begin your sacred journey through the Bhagavad Gita
      </p>
    </div>
  );
}

/**
 * EXAMPLE 3: Loading State
 */
export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <GitaSadhanaLogoLoader size={120} />
      <p className="text-muted-foreground animate-pulse">Loading verses...</p>
    </div>
  );
}

/**
 * EXAMPLE 4: Empty State (No verses found)
 */
export function EmptyStateWithLogo() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Use lotus logo for spiritual, peaceful empty state */}
      <LotusLogo size={150} animated={true} variant="simple" />
      <h3 className="font-serif text-lg text-foreground">No verses yet</h3>
      <p className="text-sm text-muted-foreground">
        Start reading to build your collection
      </p>
    </div>
  );
}

/**
 * EXAMPLE 5: Profile Avatar Replacement
 */
export function ProfileWithOmLogo() {
  return (
    <div className="flex items-center gap-4">
      {/* Use Om logo as minimal avatar */}
      <OmLogo size={64} animated={false} hideGlow={true} className="rounded-full" />
      <div>
        <p className="font-serif text-foreground">Seeker</p>
        <p className="text-xs text-muted-foreground">Spiritual Journey</p>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 6: Dialog/Modal Header
 */
export function MeditationReminderModal() {
  return (
    <div className="rounded-3xl bg-card shadow-2xl max-w-sm">
      <div className="flex flex-col items-center gap-4 p-6">
        <ChakraLogo size={100} animated={true} />
        <h2 className="font-serif text-xl text-foreground text-center">
          Time for Meditation
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Read a sacred verse and find inner peace
        </p>
        <button className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold">
          Read Now
        </button>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 7: Favicon/App Icon (use minimal logo)
 * 
 * In your HTML head:
 * <link rel="icon" href="data:image/svg+xml,..." />
 * 
 * Or use the minimal SVG directly
 */
export function FaviconExample() {
  const faviconSvg = `
    <svg width="64" height="64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="none" stroke="#9C27B0" stroke-width="2" />
      <!-- Center circle with lotus petals -->
      <circle cx="100" cy="100" r="20" fill="#9C27B0" opacity="0.8" />
      <circle cx="100" cy="100" r="8" fill="#FFD700" />
    </svg>
  `;
  return null; // This would be used in HTML head
}

/**
 * EXAMPLE 8: Background Decoration (opacity reduced)
 */
export function DashboardWithLogoBackground() {
  return (
    <div className="relative min-h-screen">
      {/* Background logo at low opacity */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <GitaSadhanaLogo variant="chakra" size={500} animated={false} />
      </div>

      {/* Content on top */}
      <div className="relative z-10 p-8">
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        {/* Your dashboard content */}
      </div>
    </div>
  );
}

/**
 * EXAMPLE 9: Splash Screen (Full Screen Logo)
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-dawn">
      <GitaSadhanaLogo
        variant="lotus"
        size={400}
        animated={true}
        withText={true}
      />
      <p className="absolute bottom-8 text-xs text-muted-foreground animate-pulse">
        Loading your spiritual journey...
      </p>
    </div>
  );
}

/**
 * EXAMPLE 10: Different Variants Showcase
 */
export function LogoVariantsShowcase() {
  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <GitaSadhanaLogo variant="chakra" size={200} animated={true} />
        <p className="text-sm font-semibold">Chakra - Energy Centers</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <GitaSadhanaLogo variant="lotus" size={200} animated={true} />
        <p className="text-sm font-semibold">Lotus - Enlightenment</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <GitaSadhanaLogo variant="om" size={200} animated={true} />
        <p className="text-sm font-semibold">Om - Primordial Sound</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <GitaSadhanaLogo variant="minimal" size={200} animated={false} />
        <p className="text-sm font-semibold">Minimal - Clean Design</p>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CUSTOMIZATION PROPS REFERENCE
// ============================================================================

/**
 * ChakraLogo Props:
 * - size?: number (default: 200)
 * - animated?: boolean (default: true) - Enables rotating chakra rings
 * - className?: string - Additional CSS classes
 * 
 * LotusLogo Props:
 * - size?: number (default: 200)
 * - animated?: boolean (default: true) - Enables petal bloom animation
 * - className?: string
 * - variant?: "simple" | "detailed" | "minimal" (default: "detailed")
 * 
 * OmLogo Props:
 * - size?: number (default: 200)
 * - animated?: boolean (default: true) - Enables glow pulse animation
 * - className?: string
 * - hideGlow?: boolean (default: false) - Hide the glow effect
 * 
 * GitaSadhanaLogo Props:
 * - variant?: "chakra" | "lotus" | "om" | "minimal" (default: "chakra")
 * - size?: number (default: 200)
 * - withText?: boolean (default: false) - Show "Gita Sadhana" text
 * - animated?: boolean (default: true)
 * - className?: string
 * 
 * GitaSadhanaLogoLoader Props:
 * - size?: number (default: 100)
 * - className?: string
 */

// ============================================================================
// 4. STYLING RECOMMENDATIONS
// ============================================================================

/**
 * The logos are designed to work with your existing theme system.
 * They use these color variables (adjust in your CSS/tailwind):
 * 
 * Primary colors used:
 * - Purple: #9C27B0, #7B1FA2, #6A1B9A (spiritual, meditation)
 * - Gold: #FFD700 (divine, center/bindu)
 * - Chakra colors: Red, Orange, Yellow, Green, Blue, Indigo, Violet
 * 
 * For dark/light modes:
 * - Logos automatically adapt based on your theme
 * - Adjust opacity in dark mode for better contrast
 */

// ============================================================================
// 5. BEST PRACTICES
// ============================================================================

/**
 * ✓ Use static version (ChakraLogoStatic) in headers for performance
 * ✓ Use animated version on hero/splash screens for engagement
 * ✓ Use minimal variant for small spaces (favicons, avatars)
 * ✓ Use lotus variant for empty/peaceful states
 * ✓ Use om variant for meditation features
 * ✓ Always set size prop based on container (responsive)
 * ✓ Use hideGlow in small sizes to reduce visual noise
 * ✓ Consider using opacity-0 on mobile for better performance
 */
