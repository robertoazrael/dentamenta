/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				mint: {
					50: '#E6F7F3',
					100: '#D1EFED',
					300: '#A7E4D4',
					500: '#6FD3C6', // Primary
					600: '#5CB9AD',
				},
				accent: '#2BB0A6', // Accent Teal
				ice: '#F6F8F9',
				soft: '#5F6F73',
				dark: '#1F2D2E',
			},
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'sans-serif'],
			},
			animation: {
				'pulse-mint': 'pulse-mint 2s infinite',
				'bounce-subtle': 'bounce 3s infinite',
			},
			keyframes: {
				'pulse-mint': {
					'0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(111, 211, 198, 0.4)' },
					'50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(111, 211, 198, 0)' },
				}
			}
		}
	},
	plugins: [],
}
