/**
 * 🏨 HOTEL CONFIGURATION — Single source of truth
 * ────────────────────────────────────────────────
 * Edit this file ONCE to rebrand the entire site + dashboard for a new hotel.
 *
 * What changes when you edit this file:
 *   • Hotel name → Navbar logo, Footer, Hero, About, Booking emails, Dashboard header,
 *                  browser tab title, SEO meta tags
 *   • Contact info (phone, email, address) → Navbar, Footer, About section
 *   • Tagline / description → Hero, Footer, SEO meta description
 *   • Brand colors → applied to the whole Tailwind theme (gold, primary, accent, bg)
 *   • Fonts → headings + body across the entire site
 *   • Hero image → src/assets/hotel-hero.jpg (replace the file with the same name)
 *   • Logo / social links → Footer, Navbar
 *
 * Colors must be in HSL format: "H S% L%" (e.g. "36 65% 45%"). No `hsl()` wrapper.
 * Use https://hslpicker.com/ to convert hex → HSL.
 */

export const hotelConfig = {
  // ─── Identity ─────────────────────────────────────────
  name: "Silver Hotel",
  nameSuffix: "Kigali", // shown after name on hero (e.g. "Silver Hotel — Kigali")
  fullName: "Silver Hotel Kigali",
  tagline: "Luxury Stay in Rwanda",
  description:
    "Experience luxury and comfort in the heart of Africa's most vibrant city. Your perfect stay awaits.",
  shortDescription:
    "Your home away from home in the heart of Kigali, Rwanda. Experience comfort, hospitality, and African warmth.",
  // Default ratings — overridden at runtime by editable values from the dashboard (hotel_settings table)
  starRating: 3,
  reviewScore: 3.8,
  reviewCount: 87,
  // When true, ratings shown publicly come from the dashboard (hotel_settings) and can be edited there.
  editableRatings: true,

  // ─── Map (Location section before footer) ─────────────
  // Replace src/assets/hotel-map.jpg with a screenshot of your Google Maps location
  map: {
    // Optional: lat/lng if you later switch to an embedded interactive map
    latitude: -1.9499,
    longitude: 30.0589,
    zoom: 15,
    // Path to the static map image shown in the Location section
    imageUrl: "/src/assets/hotel-map.jpg",
  },

  // ─── Contact ──────────────────────────────────────────
  phone: "0781 088 725",
  phoneHref: "tel:+250781088725",
  email: "info@silverhotelkigali.com",
  address: "KG 48 St, Kigali, Rwanda",
  district: "Gasabo district",
  city: "Kigali",
  country: "Rwanda",

  // ─── Operations ───────────────────────────────────────
  checkInTime: "From 16:00",
  checkOutTime: "Until 11:00",
  currency: "RF", // shown next to room prices

  // ─── Social ───────────────────────────────────────────
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },

  // ─── Hero ─────────────────────────────────────────────
  // To change the hero image: replace src/assets/hotel-hero.jpg
  hero: {
    welcomeText: "Welcome to",
    primaryCta: { label: "View Our Rooms", href: "#rooms" },
    secondaryCta: { label: "Book Now", href: "#booking" },
  },

  // ─── About blurb (shown on About section) ─────────────
  about: {
    paragraph1:
      "Nestled in the Gasabo district of Kigali, Silver Hotel offers a perfect blend of modern comfort and warm African hospitality. Our 3-star hotel provides an ideal base for both business and leisure travelers exploring Rwanda's vibrant capital.",
    paragraph2:
      "Located near the Kigali Genocide Memorial and the bustling Kimironko Market, we offer easy access to the city's most important landmarks and cultural attractions.",
  },

  // ─── Theme — Colors (HSL: "H S% L%") ──────────────────
  // These override the values in src/index.css at runtime.
  theme: {
    colors: {
      background: "30 20% 98%",
      foreground: "25 30% 12%",
      card: "30 15% 96%",
      primary: "36 65% 45%",
      primaryForeground: "30 20% 98%",
      secondary: "30 15% 92%",
      muted: "30 10% 94%",
      mutedForeground: "25 10% 45%",
      accent: "36 50% 50%",
      border: "30 15% 88%",
      // Brand "gold" accent — used on CTAs, highlights, prices
      gold: "36 65% 45%",
      goldLight: "36 60% 70%",
      goldDark: "36 70% 30%",
      // Dark warm tone — used on Navbar, Footer, Booking section background
      warmDark: "25 30% 8%",
      warmBg: "30 25% 95%",
      // Color of the navigation bar links (Home, Rooms, Amenities, etc.)
      navLink: "0 0% 75%", // silver
      navLinkHover: "36 65% 45%", // gold on hover
    },
    // Fonts — must be loaded in src/index.css via @import url(...)
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
    },
  },
} as const;

export type HotelConfig = typeof hotelConfig;
