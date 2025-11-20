/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/frontend/src/**/*.{html,ts}', // Angular templates
    './libs/**/*.{html,ts}', // shared libs (if any)
  ],
  theme: { extend: {} },
  plugins: [require('daisyui')],
};
