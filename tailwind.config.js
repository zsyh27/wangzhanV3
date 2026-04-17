/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#3B82F6',
        cta: '#F97316',
        background: '#F8FAFC',
        text: '#1E293B',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0,0,0,0.05)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.1)',
        'xl': '0 20px 25px rgba(0,0,0,0.15)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1E293B',
            h2: {
              fontWeight: '600',
              color: '#2563EB',
            },
            h3: {
              fontWeight: '600',
              color: '#2563EB',
            },
            p: {
              textAlign: 'justify',
            },
          },
        },
      },
      textIndent: {
        '4': '1em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
