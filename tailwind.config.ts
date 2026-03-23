import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f6f7",
          100: "#e2e7eb",
          200: "#c5cfd7",
          300: "#9aabb8",
          400: "#6d8494",
          500: "#4a6275",
          600: "#2C3E50",
          700: "#253545",
          800: "#1C2833",
          900: "#141c24",
          950: "#0d1218",
          DEFAULT: "#2C3E50",
        },
        secondary: {
          50: "#faf7f3",
          100: "#f0ebe2",
          200: "#dfd3c3",
          300: "#ccb89e",
          400: "#b8a07e",
          500: "#A68B6B",
          600: "#8f7358",
          700: "#755c47",
          800: "#5d4a3b",
          900: "#4a3c31",
          DEFAULT: "#A68B6B",
        },
        accent: {
          50: "#fbf8f0",
          100: "#f5ecd6",
          200: "#ead8ad",
          300: "#dfc07e",
          400: "#C5A55A",
          500: "#b8963f",
          600: "#9a7a33",
          700: "#7c612a",
          800: "#5e4920",
          900: "#403218",
          DEFAULT: "#C5A55A",
        },
        dark: "#1C2833",
        light: "#FAF8F5",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Playfair Display", "serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        accent: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.15)',
        'glow-primary': '0 0 20px rgba(27, 58, 107, 0.15)',
        'card': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
