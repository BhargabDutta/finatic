export const COLORS = {
  // Base Canvas & Ink
  paper: '#F4F0EA',
  paperDark: '#E8E2D5',
  ink: '#0A0A0A',
  white: '#FFFFFF',
  black: '#000000',
  border: '#0A0A0A',
  mutedText: '#666666',
  faintBorder: '#D0C9BD',

  // Neo-Brutalist Vivid Accent Colors
  yellow: '#FFE600',   // Warning / OTP / Highlight
  lime: '#00E575',     // Inflow / Credit / Positive
  coral: '#FF3366',    // Outflow / Debit / Expense
  orange: '#FF6B00',   // Bills due / Action required
  purple: '#7B61FF',   // Investment / Assets
  cyan: '#00F0FF',     // Intel / Stats / Technical
  blue: '#2B59FF',     // Bank / Official
  pink: '#FF80BF',     // Promotional / Offers
  gray: '#E6E1D8',     // Secondary blocks
  lightGray: '#E2DDD5', // Disabled states

  // Semantic Categories
  debit: '#FF3366',
  credit: '#00E575',
  billDue: '#FF6B00',
  otp: '#FFE600',
  investment: '#7B61FF',
  promotional: '#FF80BF',
  general: '#00F0FF',
} as const;

export type AppColor = keyof typeof COLORS;
