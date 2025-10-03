import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './frontend/src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
