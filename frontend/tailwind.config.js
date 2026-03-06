/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "primary-light": "var(--primary-light)",
                "bg-main": "var(--bg-main)",
                "bg-sidebar": "var(--bg-sidebar)",
                "text-main": "var(--text-main)",
                "text-muted": "var(--text-muted)",
                border: "var(--border-color)",
                accent: {
                    orange: "var(--accent-orange)",
                    red: "var(--accent-red)",
                    purple: "var(--accent-purple)",
                    blue: "var(--accent-blue)",
                    green: "var(--accent-green)",
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
