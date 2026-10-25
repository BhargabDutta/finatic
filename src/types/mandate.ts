export type PaymentRail = 'UPI_AUTOPAY' | 'CARD_SI' | 'NACH' | 'APP_STORE';

export type ThreatType = 
  | 'NONE'
  | 'PRICE_CREEP'
  | 'TRIAL_TRAP'
  | 'DOUBLE_SUBSCRIPTION'
  | 'ZOMBIE_CHARGE'
  | 'IRREGULAR_USAGE';

export type MandateFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'IRREGULAR_USAGE';

export interface DebitEvent {
  id: string;
  date: string;
  amount: number;
  rawDescriptor: string;
  account: string;
  isTrialAuth?: boolean;
}

export interface CancellationStep {
  step: number;
  title: string;
  instruction: string;
}

export interface GhostingNotice {
  subject: string;
  body: string;
  legalRef: string;
}

export interface Mandate {
  id: string;
  merchantName: string;
  category: string;
  rawDescriptor: string;
  aliases: string[];
  paymentRail: PaymentRail;
  account: string;
  umrn?: string;
  frequency: MandateFrequency;
  currentAmount: number;
  previousAmount?: number;
  priceIncreaseAmount?: number;
  priceIncreasePercent?: number;
  monthlyEstimate: number;
  annualEstimate: number;
  firstSeenDate: string;
  lastChargedDate: string;
  threatType: ThreatType;
  threatDescription?: string;
  status: 'ACTIVE' | 'FLAGGED' | 'CANCELLED';
  cancellationSteps: CancellationStep[];
  ghostingNotice: GhostingNotice;
  chargeHistory: DebitEvent[];
}

export interface MandateRadarStats {
  totalMandates: number;
  totalAnnualBleed: number;
  totalMonthlyBleed: number;
  threatsCount: number;
  priceCreepsCount: number;
  trialTrapsCount: number;
  doubleSubscriptionsCount: number;
  zombieChargesCount: number;
  lastAuditedTimestamp: number;
}
