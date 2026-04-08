/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",  
  theme: {
    extend: {
        animation: {
      "spin-slow": "spin 10s linear infinite",
    },
      colors: {
        primary: '#05CE99',    
        secondary: '#2298D3',  
      },
      screens: {
        'phone': { 'max': '550px' },
        'tablet': { 'max': '768px' },
        'laptop': { 'max': '1024px' },
        'desktop': { 'max': '1200px' },
      },
    },
  },
  plugins: [],
}


