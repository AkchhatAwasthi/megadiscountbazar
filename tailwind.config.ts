import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				'inter': ['var(--font-inter)'],
				'sans': ['var(--font-inter)'],
			},
			colors: {
				border: 'var(--border-default)',
				input: 'var(--border-default)',
				ring: 'var(--blue-primary)',
				background: 'var(--surface-light)',
				foreground: 'var(--text-primary)',
				primary: {
					DEFAULT: 'var(--blue-primary)',
					foreground: '#FFFFFF',
					hover: 'var(--blue-deep)',
				},
				secondary: {
					DEFAULT: 'var(--text-secondary)',
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: 'var(--red-sale)',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: 'var(--surface-light)',
					foreground: 'var(--text-muted)',
				},
				accent: {
					DEFAULT: 'var(--yellow-accent)',
					foreground: 'var(--text-primary)',
				},
				popover: {
					DEFAULT: 'var(--surface-white)',
					foreground: 'var(--text-primary)',
				},
				card: {
					DEFAULT: 'var(--surface-white)',
					foreground: 'var(--text-primary)',
				},
				'blue-primary': 'var(--blue-primary)',
				'blue-deep': 'var(--blue-deep)',
				'blue-light': 'var(--blue-light)',
				'yellow-accent': 'var(--yellow-accent)',
				'yellow-hover': 'var(--yellow-hover)',
				'red-sale': 'var(--red-sale)',
				'green-fresh': 'var(--green-fresh)',
				'surface-light': 'var(--surface-light)',
				'surface-white': 'var(--surface-white)',
				'text-primary': 'var(--text-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-muted': 'var(--text-muted)',
				'border-default': 'var(--border-default)',
				'border-hover': 'var(--border-hover)',
			},
			boxShadow: {
				'soft': '0 8px 24px rgba(0, 0, 0, 0.1)',
			},
			borderRadius: {
				lg: 'var(--radius-product)',
				md: 'var(--radius-button)',
				sm: 'var(--radius-badge)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
