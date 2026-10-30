export const COLORS = {
  // Base Canvas & Ink (Sophisticated Architectural Monochrome)
  paper: '#F8F9FA',      // Clean, bright neutral canvas
  paperDark: '#EFEFEF',  // Secondary surface
  ink: '#111827',        // Rich deep charcoal / near black
  white: '#FFFFFF',
  black: '#000000',
  border: '#111827',
  mutedText: '#6B7280',  // High-legibility neutral gray
  faintBorder: '#E5E7EB', // Subtle card dividers

  // Disciplined Brutalist Accents (High contrast, zero neon clash)
  yellow: '#F59E0B',     // Warm amber for highlights & warnings
  lime: '#10B981',       // Crisp emerald for safe status / inflows / credit
  coral: '#EF4444',      // Crisp crimson for debit / threat / cancellation
  orange: '#F97316',     // Clean burnt orange for bills & alerts
  purple: '#6366F1',     // Indigo for investments
  cyan: '#0284C7',       // Slate blue / cyan for technical metadata
  blue: '#2563EB',       // Official banking blue
  pink: '#DB2777',       // Muted magenta
  gray: '#F3F4F6',       // Neutral card backing
  lightGray: '#E5E7EB',  // Subtle borders

  // Semantic Categories
  debit: '#EF4444',
  credit: '#10B981',
  billDue: '#F97316',
  otp: '#F59E0B',
  investment: '#6366F1',
  promotional: '#DB2777',
  general: '#0284C7',
} as const;

export type AppColor = keyof typeof COLORS;

