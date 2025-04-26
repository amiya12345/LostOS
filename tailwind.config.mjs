/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        omiofont1: ["PixeloidMono-d94EV", "sans-serif"],
       
       
      },
      animation: {
        matrix: 'matrix 5s linear infinite'
      },
      keyframes: {
        matrix: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(100vh)', opacity: '1' }
        }
    },
  }
  },
  plugins: [],
};
