/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#1A5C38',
        'primary-light': '#236B44',
        'primary-dark':  '#134529',
        accent:    '#9A7B2F',
        'accent-light': '#B8963A',
        danger:    '#C0392B',
        bg:        '#FAFAF8',
        surface:   '#FFFFFF',
        muted:     '#6B7280',
        border:    '#EEEBE4',
        'text-1':  '#1A1A1A',
        'text-2':  '#4A5568',
      },
      fontFamily: {
        sans:   ['"Plus Jakarta Sans"', 'sans-serif'],
        arabic: ['"Amiri"', 'serif'],
        mono:   ['"Plus Jakarta Sans"', 'monospace'],
      },
    },
  },
  plugins: [],
}
