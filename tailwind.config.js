module.exports = {
    darkMode: ['class'],
    content: ['index.html','./src/**/*.{js,jsx,ts,tsx,vue,html}'],
  theme: {
  	extend: {
  		colors: {
  			neutral: {
  				'50': '#fafafa',
  				'100': '#f5f5f5',
  				'200': '#e5e5e5',
  				'300': '#d4d4d4',
  				'400': '#a3a3a3',
  				'500': '#737373',
  				'600': '#525252',
  				'700': '#404040',
  				'750': '#374151',
  				'800': '#262626',
  				'900': '#171717',
  				'950': '#0a0a0a'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					color: '#e5e7eb',
  					maxWidth: 'none',
  					lineHeight: '1.7',
  					h1: {
  						color: '#f3f4f6',
  						fontWeight: '700'
  					},
  					h2: {
  						color: '#f3f4f6',
  						fontWeight: '600'
  					},
  					h3: {
  						color: '#f3f4f6',
  						fontWeight: '600'
  					},
  					h4: {
  						color: '#f3f4f6',
  						fontWeight: '500'
  					},
  					'h1, h2, h3, h4': {
  						marginTop: '1.5em',
  						marginBottom: '0.75em'
  					},
  					p: {
  						marginTop: '1em',
  						marginBottom: '1em'
  					},
  					strong: {
  						color: '#f9fafb',
  						fontWeight: '600'
  					},
  					code: {
  						color: '#d1d5db',
  						backgroundColor: '#374151',
  						padding: '0.25rem 0.5rem',
  						borderRadius: '0.375rem',
  						fontWeight: '500'
  					},
  					pre: {
  						backgroundColor: '#1f2937',
  						color: '#e5e7eb',
  						borderRadius: '0.5rem',
  						padding: '1rem',
  						marginTop: '1.5em',
  						marginBottom: '1.5em',
  						overflow: 'auto'
  					},
  					blockquote: {
  						borderLeftColor: '#6b7280',
  						backgroundColor: '#1f2937',
  						padding: '1rem 1.5rem',
  						borderRadius: '0.5rem',
  						fontStyle: 'italic',
  						color: '#d1d5db'
  					},
  					a: {
  						color: '#60a5fa',
  						textDecoration: 'none',
  						'&:hover': {
  							color: '#93c5fd',
  							textDecoration: 'underline'
  						}
  					},
  					ul: {
  						listStyleType: 'disc',
  						paddingLeft: '1.5rem',
  						marginTop: '1rem',
  						marginBottom: '1rem'
  					},
  					ol: {
  						listStyleType: 'decimal',
  						paddingLeft: '1.5rem',
  						marginTop: '1rem',
  						marginBottom: '1rem'
  					},
  					li: {
  						marginTop: '0.5rem',
  						marginBottom: '0.5rem'
  					},
  					table: {
  						width: '100%',
  						borderCollapse: 'collapse',
  						marginTop: '1.5rem',
  						marginBottom: '1.5rem'
  					},
  					th: {
  						backgroundColor: '#374151',
  						color: '#f9fafb',
  						fontWeight: '600',
  						padding: '0.75rem',
  						border: '1px solid #4b5563'
  					},
  					td: {
  						padding: '0.75rem',
  						border: '1px solid #4b5563',
  						color: '#e5e7eb'
  					},
  					'thead th': {
  						borderBottomWidth: '2px',
  						borderBottomColor: '#6b7280'
  					}
  				}
  			}
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
  plugins: [
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
}