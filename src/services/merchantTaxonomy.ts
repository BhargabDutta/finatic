export interface MerchantEntity {
  id: string;
  name: string;
  category: string;
  icon: string;
  defaultRail: 'UPI_AUTOPAY' | 'CARD_SI' | 'NACH' | 'APP_STORE';
  patterns: RegExp[];
  cancellationUrl?: string;
}

export const MERCHANT_TAXONOMY: MerchantEntity[] = [
  {
    id: 'merch_netflix',
    name: 'Netflix',
    category: 'Entertainment / OTT',
    icon: '🎬',
    defaultRail: 'UPI_AUTOPAY',
    patterns: [
      /\b(?:billdesk\*|nach-)?nflx(?:_mum|_in|_autopay)?\b/i,
      /\bnetflix(?:_entertainment|_in|_sub)?\b/i,
      /\b(?:ach[-_]|si-)?nflx\b/i,
    ],
    cancellationUrl: 'https://www.netflix.com/youraccount',
  },
  {
    id: 'merch_amazon_prime',
    name: 'Amazon Prime',
    category: 'E-Commerce & Video',
    icon: '📦',
    defaultRail: 'CARD_SI',
    patterns: [
      /\b(?:ach[-_]cr[-_])?amzn[-_*]prm(?:[-_*]\d+[-_*]blr)?\b/i,
      /\bamazon[-_*]prime(?:[-_*]autopay)?\b/i,
      /\b(?:si-)?amzn[-_*]digital\b/i,
    ],
    cancellationUrl: 'https://www.amazon.in/mc/manage',
  },
  {
    id: 'merch_hotstar',
    name: 'Disney+ Hotstar',
    category: 'Entertainment / OTT',
    icon: '⭐',
    defaultRail: 'CARD_SI',
    patterns: [
      /\b(?:si[-_]hdfc[-_]|billdesk\*)?hotstar(?:[-_*]mum)?\b/i,
      /\b(?:google\*|play\*)disneyhotstar\b/i,
      /\bnoida\*hotstar\b/i,
    ],
    cancellationUrl: 'https://www.hotstar.com/in/subscribe/my-account',
  },
  {
    id: 'merch_spotify',
    name: 'Spotify Premium',
    category: 'Audio Streaming',
    icon: '🎧',
    defaultRail: 'UPI_AUTOPAY',
    patterns: [
      /\b(?:billdesk\*|si-)?spotify(?:[-_*]in)?\b/i,
      /\bspotify[-_*]india(?:[-_*]autopay)?\b/i,
    ],
    cancellationUrl: 'https://www.spotify.com/in-en/account/overview/',
  },
  {
    id: 'merch_canva',
    name: 'Canva Pro',
    category: 'Productivity & Design',
    icon: '🎨',
    defaultRail: 'CARD_SI',
    patterns: [
      /\b(?:ach\*|si-)?canva(?:[-_*]sub|[-_*]monthly|[-_*]trial)?(?:[-_*]blr)?\b/i,
      /\bcanva\*trial\*auth\b/i,
    ],
    cancellationUrl: 'https://www.canva.com/settings/billing-and-teams',
  },
  {
    id: 'merch_cultfit',
    name: 'Cult.fit Fitness',
    category: 'Health & Fitness',
    icon: '🏋️',
    defaultRail: 'NACH',
    patterns: [
      /\b(?:nach[-_]dr[-_]|ach[-_])?cultfit(?:[-_*]blr[-_*]\d+)?\b/i,
      /\bcurefit(?:[-_*]monthly[-_*]pass)?\b/i,
    ],
    cancellationUrl: 'https://www.cult.fit/profile/subscriptions',
  },
  {
    id: 'merch_aws',
    name: 'AWS Cloud Services',
    category: 'Cloud Infrastructure',
    icon: '☁️',
    defaultRail: 'CARD_SI',
    patterns: [
      /\bamzn\s+web\s+services(?:\s+mum)?\b/i,
      /\baws[-_*]cloud[-_*]in(?:[-_*]mumbai)?\b/i,
    ],
    cancellationUrl: 'https://console.aws.amazon.com/billing/',
  },
  {
    id: 'merch_jio_fiber',
    name: 'Jio Fiber Broadband',
    category: 'Utilities / Internet',
    icon: '🌐',
    defaultRail: 'UPI_AUTOPAY',
    patterns: [
      /\bjio[-_*]fiber[-_*]autopay\b/i,
      /\breliance[-_*]jio[-_*]infocomm\b/i,
    ],
    cancellationUrl: 'https://www.jio.com/selfcare/plans',
  },
  {
    id: 'merch_swiggy_one',
    name: 'Swiggy One',
    category: 'Food & Groceries',
    icon: '🍔',
    defaultRail: 'CARD_SI',
    patterns: [
      /\b(?:si[-_]hdfc[-_]|ach[-_])?swiggy[-_*]super(?:[-_*]mum)?\b/i,
      /\bswiggy[-_*]one(?:[-_*]membership)?\b/i,
    ],
    cancellationUrl: 'https://www.swiggy.com/my-account',
  },
  {
    id: 'merch_google_one',
    name: 'Google One Storage',
    category: 'Cloud Storage',
    icon: '💾',
    defaultRail: 'APP_STORE',
    patterns: [
      /\bgoogle\*storage(?:[-_*]in)?\b/i,
      /\bgoogle\*one(?:[-_*]100gb)?\b/i,
    ],
    cancellationUrl: 'https://one.google.com/storage',
  },
];

/**
 * Strips clearinghouse codes, payment gateways, and geographical suffixes
 */
export function cleanDescriptorString(raw: string): string {
  if (!raw) return 'Unknown Mandate';

  let cleaned = raw
    .replace(/\b(?:BILLDESK\*|ACH[-_*]CR[-_*]|ACH[-_*]DR[-_*]|NACH[-_*]DR[-_*]|SI[-_][A-Z]+[-_]|RAZORPAY\*|PAYTM\*|GPAY\*)\b/gi, '')
    .replace(/\b(?:MUM|BLR|DEL|HYD|IN|AUTOPAY|SUB|MONTHLY|TRIAL|AUTH)\b/gi, '')
    .replace(/[-_*]{2,}/g, ' ')
    .replace(/[-_*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || raw;
}

/**
 * Resolves a raw statement string into a canonical Merchant Entity
 */
export function resolveMerchantEntity(rawString: string): {
  merchant: MerchantEntity;
  confidence: number;
} {
  const normalized = rawString.trim().toLowerCase();

  for (const entity of MERCHANT_TAXONOMY) {
    for (const pattern of entity.patterns) {
      if (pattern.test(normalized)) {
        return {
          merchant: entity,
          confidence: 0.98,
        };
      }
    }
  }

  // Fallback for unrecognized merchants
  const cleanedName = cleanDescriptorString(rawString);
  const fallbackEntity: MerchantEntity = {
    id: `merch_${cleanedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: cleanedName.toUpperCase(),
    category: 'Recurring Subscription',
    icon: '💳',
    defaultRail: 'UPI_AUTOPAY',
    patterns: [],
  };

  return {
    merchant: fallbackEntity,
    confidence: 0.5,
  };
}
