import type {Config} from "tailwindcss"

const config: Config = {
    darkMode: ["class", "html"], // <--- Changed this line
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
        "*.{js,ts,jsx,tsx,mdx}", // Ensure this line is present to scan root-level files
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
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
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
            },
            fontSize: {
                xs: ["0.75rem", {lineHeight: "1rem"}],
                sm: ["0.875rem", {lineHeight: "1.25rem"}],
                base: ["1rem", {lineHeight: "1.5rem"}],
                lg: ["1.125rem", {lineHeight: "1.75rem"}],
                xl: ["1.25rem", {lineHeight: "1.75rem"}],
                "2xl": ["1.5rem", {lineHeight: "2rem"}],
                "3xl": ["1.875rem", {lineHeight: "2.25rem"}],
                "4xl": ["2.25rem", {lineHeight: "2.5rem"}],
            },
            spacing: {
                "18": "4.5rem",
                "88": "22rem",
                "128": "32rem",
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.2s ease-in-out",
                "slide-in": "slide-in 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                "accordion-down": {
                    from: {height: "0"},
                    to: {height: "var(--radix-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--radix-accordion-content-height)"},
                    to: {height: "0"},
                },
                "fade-in": {
                    from: {opacity: "0", transform: "translateY(-4px)"},
                    to: {opacity: "1", transform: "translateY(0)"},
                },
                "slide-in": {
                    from: {opacity: "0", transform: "translateX(-8px)"},
                    to: {opacity: "1", transform: "translateX(0)"},
                },
            },
            boxShadow: {
                soft: "0 2px 8px 0 rgba(0, 0, 0, 0.05)",
                medium: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
                hard: "0 8px 24px 0 rgba(0, 0, 0, 0.15)",
            },
            backdropBlur: {
                xs: "2px",
            },
            screens: {
                xs: "475px",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config