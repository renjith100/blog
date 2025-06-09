/** @type {import('tailwindcss').Config} */
// This is a TypeScript type annotation that provides IDE autocompletion for the config

module.exports = {
    // content: Tells Tailwind which files to scan for class names
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}', // Scans all files in app directory
        './components/**/*.{js,ts,jsx,tsx,mdx}', // Scans all files in components directory
    ],

    // darkMode: Configures how dark mode works
    darkMode: 'class', // 'media' means it follows system preferences
    // 'class' would let you toggle manually with a class

    // theme: Customizes your design tokens
    theme: {
        extend: {
            // 'extend' keeps default values and adds/overrides specific ones
            fontFamily: {
                base: ['var(--font-base)', 'system-ui', 'sans-serif'],
                display: [
                    'var(--font-display)',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
                mono: [
                    'var(--font-mono)',
                    'ui-monospace',
                    'Cascadia Code',
                    'Source Code Pro',
                    'Menlo',
                    'Consolas',
                    'DejaVu Sans Mono',
                    'monospace',
                ],
            },
        },
    },

    // plugins: Array of Tailwind plugins to add extra functionality
    plugins: [], // Currently empty, but you can add plugins like @tailwindcss/typography
};
