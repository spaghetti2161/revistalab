import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#191919',
        elevated: '#252525',
        overlay: '#2f2f2f',
        border: '#373737',
        'text-primary': '#E8E8E8',
        'text-muted': '#A0A0A0',
        'text-faint': '#666666',
        accent: '#D4B896',
        'accent-hover': '#E8CDA8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#E8E8E8',
            a: { color: '#D4B896', '&:hover': { color: '#E8CDA8' } },
            h1: { color: '#E8E8E8' },
            h2: { color: '#E8E8E8' },
            h3: { color: '#E8E8E8' },
            h4: { color: '#E8E8E8' },
            strong: { color: '#E8E8E8' },
            blockquote: { color: '#A0A0A0', borderLeftColor: '#373737' },
            code: { color: '#D4B896', background: '#2f2f2f' },
            'pre code': { background: 'transparent' },
            pre: { background: '#2f2f2f' },
            hr: { borderColor: '#373737' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
