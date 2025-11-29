/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["index.html", "./src/**/*.{js,jsx,ts,tsx,vue,html}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 20px -5px hsl(var(--primary) / 0.5)",
        "glow-lg": "0 0 30px -5px hsl(var(--primary) / 0.6)",
        "glow-sm": "0 0 10px -2px hsl(var(--primary) / 0.4)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "hsl(var(--foreground))",
            maxWidth: "none",
            lineHeight: "1.7",
            h1: {
              color: "hsl(var(--foreground))",
              fontWeight: "700",
            },
            h2: {
              color: "hsl(var(--foreground))",
              fontWeight: "600",
            },
            h3: {
              color: "hsl(var(--foreground))",
              fontWeight: "600",
            },
            h4: {
              color: "hsl(var(--foreground))",
              fontWeight: "500",
            },
            "h1, h2, h3, h4": {
              marginTop: "1.5em",
              marginBottom: "0.75em",
            },
            p: {
              marginTop: "1em",
              marginBottom: "1em",
            },
            strong: {
              color: "hsl(var(--foreground))",
              fontWeight: "600",
            },
            code: {
              color: "hsl(var(--foreground))",
              backgroundColor: "hsl(var(--muted))",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
              borderRadius: "0.5rem",
              padding: "1rem",
              marginTop: "1.5em",
              marginBottom: "1.5em",
              overflow: "auto",
            },
            blockquote: {
              borderLeftColor: "hsl(var(--border))",
              backgroundColor: "hsl(var(--muted))",
              padding: "1rem 1.5rem",
              borderRadius: "0.5rem",
              fontStyle: "italic",
              color: "hsl(var(--muted-foreground))",
            },
            a: {
              color: "hsl(var(--primary))",
              textDecoration: "none",
              "&:hover": {
                color: "hsl(var(--primary) / 0.8)",
                textDecoration: "underline",
              },
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            ol: {
              listStyleType: "decimal",
              paddingLeft: "1.5rem",
              marginTop: "1rem",
              marginBottom: "1rem",
            },
            li: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
            },
            th: {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
              fontWeight: "600",
              padding: "0.75rem",
              border: "1px solid hsl(var(--border))",
            },
            td: {
              padding: "0.75rem",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            },
            "thead th": {
              borderBottomWidth: "2px",
              borderBottomColor: "hsl(var(--border))",
            },
          },
        },
      },
      fontFamily: {
        mono: "var(--font-mono)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
