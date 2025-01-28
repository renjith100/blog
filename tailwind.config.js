/** @type {import('tailwindcss').Config} */
// This is a TypeScript type annotation that provides IDE autocompletion for the config

module.exports = {
  // content: Tells Tailwind which files to scan for class names
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',  // Scans all files in app directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',  // Scans all files in components directory
  ],

  // darkMode: Configures how dark mode works
  darkMode: 'class',  // 'media' means it follows system preferences
                      // 'class' would let you toggle manually with a class

  // theme: Customizes your design tokens
  theme: {
    extend: {  // 'extend' keeps default values and adds/overrides specific ones
      fontFamily: {
        // These map Tailwind's font-sans and font-mono utilities 
        // to your Geist font CSS variables
        sans: ['var(--font-geist-sans)'],  // Use with: font-sans
        mono: ['var(--font-geist-mono)'],  // Use with: font-mono
      },
    },
  },

  // plugins: Array of Tailwind plugins to add extra functionality
  plugins: [],  // Currently empty, but you can add plugins like @tailwindcss/typography
}