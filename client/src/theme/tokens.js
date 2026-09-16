/**
 * WriteMate design tokens.
 *
 * Grounding: a marketplace for handwriting/documentation work — the visual
 * world is ink, nib pens, ledgers and paper, not a generic SaaS dashboard.
 * Palette leans on deep ink-navy and a brass/gold nib accent (not the
 * default terracotta), against an aged-paper background rather than a
 * flat cream. Dark mode reads as a page under lamp-light: near-black
 * ink-blue with the same brass accent.
 */

export const palette = {
  ink: {
    900: '#141A2E', // near-black ink, dark-mode background
    800: '#1F2D50', // primary ink navy
    700: '#2C3E68',
    600: '#3B517F',
    500: '#516A9B',
  },
  paper: {
    50: '#FBF9F3',
    100: '#F1EAD9', // aged paper — light-mode background
    200: '#E6DCC4',
    300: '#D8CBA8',
  },
  brass: {
    // gold nib / sealing-wax accent — used sparingly
    300: '#E0B95C',
    400: '#C99A34',
    500: '#B0812A', // primary accent
    600: '#8C651F',
  },
  forest: {
    500: '#3F7D58', // success / verified
    600: '#2E5E41',
  },
  clay: {
    500: '#B3402A', // error / urgent
    600: '#8F3120',
  },
  slate: {
    50: '#F6F5F2',
    100: '#EBE9E3',
    300: '#B9B6AC',
    500: '#7C7A72',
    700: '#4A4842',
    900: '#221F1A',
  },
};

export const typography = {
  display: "'Fraunces', Georgia, serif", // headlines, section titles, hero numerals
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", // UI, body, tables
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 14,
};

export const layout = {
  sidebarWidth: 264,
  maxContentWidth: 1280,
};
