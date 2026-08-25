/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graph: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          supplier: '#3B82F6',
          component: '#8B5CF6',
          product: '#EC4899',
          facility: '#F59E0B',
          customer: '#10B981',
          accent: '#06B6D4'
        }
      }
    },
  },
  plugins: [],
}
