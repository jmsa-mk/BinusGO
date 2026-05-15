/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B5FEF',
        accent: '#F59E0B',
        darkbg: '#1E1B4B',
        lightbg: '#F8F9FF',
        success: '#22C55E',
        textmain: '#0F172A',
        textmuted: '#64748B',
        tj: '#F97316',
        krl: '#3B82F6',
        lrt: '#8B5CF6',
        mikro: '#14B8A6',
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
