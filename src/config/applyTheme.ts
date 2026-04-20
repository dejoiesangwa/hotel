import { hotelConfig } from "./hotel";

/**
 * Injects the colors + fonts from `hotelConfig.theme` into the document
 * as CSS custom properties, overriding the defaults in `src/index.css`.
 * Called once at app startup from App.tsx.
 */
export function applyHotelTheme() {
  const root = document.documentElement;
  const { colors, fonts } = hotelConfig.theme;

  const map: Record<string, string> = {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.foreground,
    "--popover": colors.background,
    "--popover-foreground": colors.foreground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.primaryForeground,
    "--border": colors.border,
    "--input": colors.border,
    "--ring": colors.primary,
    "--gold": colors.gold,
    "--gold-light": colors.goldLight,
    "--gold-dark": colors.goldDark,
    "--warm-dark": colors.warmDark,
    "--warm-bg": colors.warmBg,
    "--nav-link": colors.navLink,
    "--nav-link-hover": colors.navLinkHover,
  };

  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));

  // Fonts (used by .font-heading / .font-body utilities)
  root.style.setProperty("--font-heading", fonts.heading);
  root.style.setProperty("--font-body", fonts.body);

  // Document title
  document.title = `${hotelConfig.fullName} — ${hotelConfig.tagline}`;
}
