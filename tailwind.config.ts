import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // Completely restrict color palette to the mandatory 5 hex codes
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      aether: {
        bg: '#EDE8F5',      // page background, scene background, fog, calm cards
        soft: '#ADBBDA',    // secondary surfaces, inactive meshes, floor rings
        line: '#8697C4',    // wireframes, depth contours, borders, muted labels
        glow: '#7091E6',    // interactive nodes, active indicators, secondary pills, directional light
        deep: '#3D52A0',    // primary typography, primary buttons, active anchors, focus outlines
      },
    },
    extend: {
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'aether-subtle': '0 4px 20px -2px rgba(61, 82, 160, 0.08)',
        'aether-glow': '0 0 25px rgba(112, 145, 230, 0.35)',
        'aether-focus': '0 0 0 3px #3D52A0',
      },
    },
  },
  plugins: [],
};

export default config;
