import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F3D2E",
          secondary: "#1B5E20",
          ink: "#111111",
          mist: "#F4F7F5"
        }
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "Arial", "sans-serif"],
        display: ["Poppins", "Montserrat", "Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 17, 17, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
