/**
 * @file postcss.config.mjs
 * @description PostCSS 설정 - Tailwind CSS 4 사용
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
