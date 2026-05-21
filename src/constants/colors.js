export const colorPalettes = {
  dark: {
    primary: '#5EEAD4',
    secondary: '#93C5FD',
    success: '#86EFAC',
    warning: '#FBBF24',
    danger: '#FB7185',

    background: '#071A1A',
    surface: '#0E2525',
    card: '#102C2C',
    elevated: '#163636',
    text: '#ECFEFF',
    mutedText: '#9FBFC0',
    border: '#254848',

    lightTeal: '#123F3C',
    lightBlue: '#132F4A',
    lightGreen: '#153A2B',
    softRose: '#3B1C2A',
    softViolet: '#2A2448',
    tab: '#0B2020',
    input: '#0B2020',
  },
  light: {
    primary: '#0F766E',
    secondary: '#2563EB',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#E11D48',

    background: '#F3FBF8',
    surface: '#E6F4EF',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    text: '#102A2A',
    mutedText: '#5F7676',
    border: '#CDE1DD',

    lightTeal: '#CCFBF1',
    lightBlue: '#DBEAFE',
    lightGreen: '#DCFCE7',
    softRose: '#FFE4E6',
    softViolet: '#EDE9FE',
    tab: '#FFFFFF',
    input: '#FFFFFF',
  },
};

export const colors = { ...colorPalettes.dark };

export function applyColorMode(mode) {
  Object.assign(colors, colorPalettes[mode] || colorPalettes.dark);
}
