/** @type {import('tailwindcss').Config} */
config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // ajusta según tu proyecto
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ivory: '#fefbf6',
        },
      },
    },
  },
  plugins: [],
}

export default config