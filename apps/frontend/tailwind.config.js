/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/frontend/src/**/*.{html,ts}', // Angular templates
    './libs/**/*.{html,ts}', // shared libs (if any)
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: '#B22234', // American Red
          secondary: '#3C3B6E', // American Blue
          accent: '#FFFFFF', // White
          neutral: '#55595C', // Dark Gray
          'base-100': '#F3F4F6', // Light Gray
          'base-200': '#D1D5DB', // Medium Gray
          'base-300': '#FFFFFF', // White
          success: '#28A745', // Success Green
          warning: '#FFC107', // Warning Yellow
          error: '#DC3545', // Danger Red
        },
      },
      {
        dark: {
          primary: '#8B0000', // Dark Red
          secondary: '#1e1e4f', // Dark Blue
          accent: '#f0f0f0', // Light Gray
          neutral: '#cccccc', // Light Gray for dark
          'base-100': '#0A1A2F', // Deep Navy
          'base-200': '#1a1a1a', // Darker
          'base-300': '#2a2a2a', // Even darker
          success: '#4caf50', // Darker Green
          warning: '#ff9800', // Darker Yellow
          error: '#f44336', // Darker Red
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};
