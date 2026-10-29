import { 
  Mandate, 
  DebitEvent, 
  MandateRadarStats, 
  ThreatType, 
  PaymentRail,
  CancellationStep,
  GhostingNotice 
} from '../types/mandate';
import { resolveMerchantEntity } from './merchantTaxonomy';
import { SyntheticStatementRecord, generate12MonthSyntheticStatement } from './syntheticStatementGenerator';
import { SMSMessage } from '../types/sms';

/**
 * Builds cancellation runbooks based on payment rail
 */
export function getCancellationRunbook(
  rail: PaymentRail, 
  merchantName: string, 
  umrn?: string,
  accountName?: string
): { steps: CancellationStep[]; ghosting: GhostingNotice } {
  const cleanUmrn = umrn || 'UMRN' + Math.floor(10000000 + Math.random() * 90000000);

  let steps: CancellationStep[] = [];

  switch (rail) {
    case 'UPI_AUTOPAY':
      steps = [
        {
          step: 1,
          title: 'Open Your Primary UPI App',
          instruction: 'Open Google Pay, PhonePe, or Paytm where this autopay was originally authorized.',
        },
        {
          step: 2,
          title: 'Navigate to Autopay Settings',
          instruction: 'Tap your Profile picture in the top-right ➔ Select "Autopay" or "Automatic Payments".',
        },
        {
          step: 3,
          title: 'Locate Mandate & Verify UMRN',
          instruction: `Find "${merchantName}" with Mandate ID: ${cleanUmrn}.`,
        },
        {
          step: 4,
          title: 'Tap Revoke & Enter UPI PIN',
          instruction: 'Tap "Pause" or "Revoke / Delete Mandate". Confirm by entering your 4/6-digit UPI PIN. The NPCI switch will permanently terminate this mandate.',
        },
      ];
      break;

    case 'CARD_SI':
      steps = [
        {
          step: 1,
          title: 'Access Bank e-Mandate Portal (RBI SIHub)',
          instruction: `Login to your card issuing bank's standing instruction portal (${accountName || 'Your Bank'}). Under RBI regulations, all card e-mandates must be accessible here.`,
        },
        {
          step: 2,
          title: 'Authenticate via Card OTP',
          instruction: 'Enter your card last 4 digits and authenticate using the one-time password sent to your registered mobile number.',
        },
        {
          step: 3,
          title: 'Select Active Recurring Instruction',
          instruction: `Locate the active standing instruction for "${merchantName}".`,
        },
        {
          step: 4,
          title: 'Cancel Standing Instruction',
          instruction: 'Click "Opt-Out / Cancel e-Mandate". Future recurring charges will be immediately declined by the card payment network.',
        },
      ];
      break;

    case 'NACH':
      steps = [
        {
          step: 1,
          title: 'Login to Bank Netbanking',
          instruction: 'Login to your bank netbanking portal from a browser (e.g. HDFC NetBanking / SBI Online).',
        },
        {
          step: 2,
          title: 'Navigate to NACH / e-Mandates',
          instruction: 'Go to "Accounts" ➔ "Request" ➔ "Enquire on e-NACH / Stop Mandate Request".',
        },
        {
          step: 3,
          title: 'Submit Stop-Payment Form',
          instruction: `Enter Mandate Reference: ${cleanUmrn} and merchant "${merchantName}". Choose "Permanent Cancellation".`,
        },
        {
          step: 4,
          title: 'Retain Confirmation Reference',
          instruction: 'Save the bank service request reference number for your records.',
        },
      ];
      break;

    case 'APP_STORE':
      steps = [
        {
          step: 1,
          title: 'Open Google Play Store / Apple Settings',
          instruction: 'Open Google Play Store on your Android device (or Apple Settings on iOS).',
        },
        {
          step: 2,
          title: 'Open Subscriptions Tab',
          instruction: 'Tap your Profile icon ➔ Tap "Payments & Subscriptions" ➔ Tap "Subscriptions".',
        },
        {
          step: 3,
          title: 'Cancel Subscription',
          instruction: `Select "${merchantName}" ➔ Tap "Cancel Subscription" at the bottom and choose a cancellation reason.`,
        },
      ];
      break;
  }

  const ghosting: GhostingNotice = {
    subject: `Formal Notice of Mandate Revocation & Dispute: ${merchantName} [${cleanUmrn}]`,
    body: `To the Grievance Officer,

I hereby provide formal notice that I have revoked the recurring mandate authorization for ${merchantName} associated with reference ${cleanUmrn} on my account ${accountName || ''}.

Under Section 25 of the Payment and Settlement Systems Act and relevant RBI Master Directions, any debit attempt post-revocation constitutes an unauthorized transaction. Please confirm the immediate termination of billing and refund any debits processed subsequent to the cancellation request.

Regards,
Account Holder`,
    legalRef: 'Section 25, Payment and Settlement Systems Act (PSSA), 2007',
  };

  return { steps, ghosting };
}

/**
 * Analyzes synthetic or real statement records into structured Mandate graph nodes
 */
export function analyzeStatementForMandates(records: SyntheticStatementRecord[]): {
  mandates: Mandate[];
  stats: MandateRadarStats;
} {
  // Filter recurring candidate debits
  const recurringDebits = records.filter(r => r.type === 'DEBIT' && r.isRecurringMandate);

  // Group by (Merchant Entity ID + Account)
  const grouped = new Map<string, {
    rawDescriptor: string;
    account: string;
    events: DebitEvent[];
  }>();

  recurringDebits.forEach((r) => {
    const { merchant } = resolveMerchantEntity(r.rawDescriptor);
    // Key by merchant ID + account
    const groupKey = `${merchant.id}_${r.account}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        rawDescriptor: r.rawDescriptor,
        account: r.account,
        events: [],
      });
    }

    const item = grouped.get(groupKey)!;
    item.events.push({
      id: r.id,
      date: r.date,
      amount: r.amount,
      rawDescriptor: r.rawDescriptor,
      account: r.account,
      isTrialAuth: r.amount <= 2,
    });
  });

  const mandates: Mandate[] = [];

  // Track merchants across accounts for Double Subscription detection
  const merchantAccountMap = new Map<string, string[]>();

  grouped.forEach((data, groupKey) => {
    // Sort events chronologically (Chained Time-Series)
    data.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstEvent = data.events[0];
    const lastEvent = data.events[data.events.length - 1];
    const { merchant } = resolveMerchantEntity(data.rawDescriptor);

    // Track merchant accounts
    const currentAccounts = merchantAccountMap.get(merchant.id) || [];
    currentAccounts.push(data.account);
    merchantAccountMap.set(merchant.id, currentAccounts);

    // Default stats
    let threatType: ThreatType = 'NONE';
    let threatDescription = '';
    let priceIncreaseAmount = 0;
    let priceIncreasePercent = 0;
    let previousAmount = firstEvent.amount;
    const currentAmount = lastEvent.amount;

    // 1. Chained Time-Series Analysis: Check for Price Creep or Free Trial Trap
    for (let i = 0; i < data.events.length - 1; i++) {
      const e1 = data.events[i];
      const e2 = data.events[i + 1];

      // A. Free Trial Trap Detection: ₹0 - ₹2 auth followed by full plan >= ₹150 within 32 days
      if (e1.amount <= 2 && e2.amount >= 150) {
        threatType = 'TRIAL_TRAP';
        threatDescription = `Free trial token auth (₹${e1.amount}) stealthily converted into full monthly plan (₹${e2.amount}) on ${e2.date}!`;
        previousAmount = e1.amount;
        break;
      }

      // B. Silent Price Creep: Subsequent charge higher by >10%
      if (e2.amount > e1.amount && (e2.amount - e1.amount) >= 50) {
        threatType = 'PRICE_CREEP';
        priceIncreaseAmount = e2.amount - e1.amount;
        priceIncreasePercent = Math.round((priceIncreaseAmount / e1.amount) * 100);
        threatDescription = `Silent price increase detected! Fee jumped from ₹${e1.amount} to ₹${e2.amount} (+${priceIncreasePercent}%) without mandate re-authentication.`;
        previousAmount = e1.amount;
        break;
      }
    }

    // 2. Zombie Charge Detection: High-cost recurring service with 0 companion usage
    if (threatType === 'NONE' && data.events.length >= 6 && currentAmount >= 1000) {
      if (merchant.id.includes('cultfit') || merchant.category.includes('Fitness')) {
        threatType = 'ZOMBIE_CHARGE';
        threatDescription = `Dormant subscription! Billed ₹${currentAmount}/mo continuously for ${data.events.length} months with zero active visits or check-ins recorded.`;
      }
    }

    // 3. Irregular usage
    const isVariable = data.events.some(e => Math.abs(e.amount - currentAmount) > 80);
    const frequency = isVariable ? 'IRREGULAR_USAGE' : 'MONTHLY';

    // Annual Estimate
    const monthlyEstimate = currentAmount;
    const annualEstimate = isVariable 
      ? data.events.reduce((sum, e) => sum + e.amount, 0)
      : currentAmount * 12;

    const { steps, ghosting } = getCancellationRunbook(
      merchant.defaultRail, 
      merchant.name, 
      undefined, 
      data.account
    );

    mandates.push({
      id: `mandate_${merchant.id}_${data.account.replace(/[^a-zA-Z0-9]/g, '_')}`,
      merchantName: merchant.name,
      category: merchant.category,
      rawDescriptor: data.rawDescriptor,
      aliases: [data.rawDescriptor],
      paymentRail: merchant.defaultRail,
      account: data.account,
      frequency,
      currentAmount,
      previousAmount: priceIncreaseAmount > 0 ? previousAmount : undefined,
      priceIncreaseAmount: priceIncreaseAmount > 0 ? priceIncreaseAmount : undefined,
      priceIncreasePercent: priceIncreasePercent > 0 ? priceIncreasePercent : undefined,
      monthlyEstimate,
      annualEstimate,
      firstSeenDate: firstEvent.date,
      lastChargedDate: lastEvent.date,
      threatType,
      threatDescription: threatDescription || undefined,
      status: threatType !== 'NONE' ? 'FLAGGED' : 'ACTIVE',
      cancellationSteps: steps,
      ghostingNotice: ghosting,
      chargeHistory: data.events,
    });
  });

  // 4. Double Subscription Cross-Account Check
  merchantAccountMap.forEach((accounts, merchantId) => {
    if (accounts.length > 1) {
      // Multiple mandates for same merchant across different accounts
      mandates.forEach(m => {
        if (m.id.includes(merchantId)) {
          m.threatType = 'DOUBLE_SUBSCRIPTION';
          m.status = 'FLAGGED';
          m.threatDescription = `Double Subscription Alert! You are paying for ${m.merchantName} simultaneously across multiple accounts (${accounts.join(' & ')}).`;
        }
      });
    }
  });

  // Compute aggregate stats
  const totalAnnualBleed = mandates.reduce((sum, m) => sum + m.annualEstimate, 0);
  const totalMonthlyBleed = mandates.reduce((sum, m) => sum + m.monthlyEstimate, 0);
  const threatsCount = mandates.filter(m => m.threatType !== 'NONE').length;
  const priceCreepsCount = mandates.filter(m => m.threatType === 'PRICE_CREEP').length;
  const trialTrapsCount = mandates.filter(m => m.threatType === 'TRIAL_TRAP').length;
  const doubleSubscriptionsCount = mandates.filter(m => m.threatType === 'DOUBLE_SUBSCRIPTION').length;
  const zombieChargesCount = mandates.filter(m => m.threatType === 'ZOMBIE_CHARGE').length;

  const stats: MandateRadarStats = {
    totalMandates: mandates.length,
    totalAnnualBleed,
    totalMonthlyBleed,
    threatsCount,
    priceCreepsCount,
    trialTrapsCount,
    doubleSubscriptionsCount,
    zombieChargesCount,
    lastAuditedTimestamp: Date.now(),
  };

  return { mandates, stats };
}

/**
 * Convenience function to load and audit the 12-month synthetic statement
 */
export function auditSyntheticStatement(): {
  mandates: Mandate[];
  stats: MandateRadarStats;
} {
  const records = generate12MonthSyntheticStatement();
  return analyzeStatementForMandates(records);
}

/**
 * Extracts structured auto-pay Mandates directly from real or simulated SMS messages
 */
export function extractMandatesFromSMS(messages: SMSMessage[]): Mandate[] {
  const autoPayMessages = messages.filter(
    (m) => m.parsed && m.parsed.isAutoPayment && (m.parsed.amount || 0) > 0
  );
  if (autoPayMessages.length === 0) return [];

  const grouped = new Map<string, SMSMessage[]>();
  autoPayMessages.forEach((msg) => {
    const p = msg.parsed;
    const merch = p.merchant || 'Subscription';
    const acc = `${p.bankOrSender || 'Bank'} •• ${p.accountDigits || 'XXXX'}`;
    const key = `${merch}_${acc}`.toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(msg);
  });

  const mandates: Mandate[] = [];
  grouped.forEach((msgs) => {
    msgs.sort((a, b) => a.date - b.date);
    const latest = msgs[msgs.length - 1];
    const first = msgs[0];
    const p = latest.parsed;
    const amount = p.amount || 0;
    const firstAmount = first.parsed.amount || amount;
    const hasPriceHike = msgs.length > 1 && amount > firstAmount;

    const merchName = p.merchant || 'Subscription';
    const rail: PaymentRail =
      p.type === 'UPI_AUTOPAY'
        ? 'UPI_AUTOPAY'
        : p.type === 'CARD_SI'
        ? 'CARD_SI'
        : p.type === 'NACH_ECS'
        ? 'NACH'
        : 'UPI_AUTOPAY';

    const account = `${p.bankOrSender || 'Bank'} •• ${p.accountDigits || 'XXXX'}`;
    const runbook = getCancellationRunbook(rail, merchName, p.mandateReference || undefined, account);

    const chargeHistory: DebitEvent[] = msgs.map((m, idx) => ({
      id: `${m.id}_ev_${idx}`,
      date: new Date(m.date).toISOString().split('T')[0],
      amount: m.parsed.amount || 0,
      rawDescriptor: m.body,
      account,
    }));

    mandates.push({
      id: `sms_man_${latest.id}`,
      merchantName: merchName,
      category: p.category || 'General',
      rawDescriptor: latest.body,
      aliases: [merchName],
      paymentRail: rail,
      account,
      umrn: p.mandateReference || undefined,
      frequency: 'MONTHLY',
      currentAmount: amount,
      previousAmount: hasPriceHike ? firstAmount : undefined,
      priceIncreaseAmount: hasPriceHike ? amount - firstAmount : undefined,
      priceIncreasePercent: hasPriceHike ? Math.round(((amount - firstAmount) / firstAmount) * 100) : undefined,
      monthlyEstimate: amount,
      annualEstimate: amount * 12,
      firstSeenDate: new Date(first.date).toISOString().split('T')[0],
      lastChargedDate: new Date(latest.date).toISOString().split('T')[0],
      threatType: hasPriceHike ? 'PRICE_CREEP' : 'NONE',
      threatDescription: hasPriceHike ? `Increased from ₹${firstAmount} to ₹${amount}` : undefined,
      status: 'ACTIVE',
      cancellationSteps: runbook.steps,
      ghostingNotice: runbook.ghosting,
      chargeHistory,
    });
  });

  return mandates;
}

/**
 * Merges baseline knowledge graph with live SMS-detected autopay mandates
 */
export function auditCombinedMandates(messages?: SMSMessage[]): {
  mandates: Mandate[];
  stats: MandateRadarStats;
} {
  const { mandates: baseMandates } = auditSyntheticStatement();
  if (!messages || messages.length === 0) {
    return auditSyntheticStatement();
  }

  const realMandates = extractMandatesFromSMS(messages);
  if (realMandates.length === 0) {
    return auditSyntheticStatement();
  }

  const mandateMap = new Map<string, Mandate>();
  baseMandates.forEach((m) => mandateMap.set(m.merchantName.toLowerCase(), m));
  realMandates.forEach((m) => mandateMap.set(m.merchantName.toLowerCase(), m));

  const mergedMandates = Array.from(mandateMap.values());
  const totalAnnualBleed = mergedMandates.reduce((sum, m) => sum + m.annualEstimate, 0);
  const totalMonthlyBleed = mergedMandates.reduce((sum, m) => sum + m.monthlyEstimate, 0);
  const threatsCount = mergedMandates.filter((m) => m.threatType !== 'NONE').length;
  const priceCreepsCount = mergedMandates.filter((m) => m.threatType === 'PRICE_CREEP').length;
  const trialTrapsCount = mergedMandates.filter((m) => m.threatType === 'TRIAL_TRAP').length;
  const doubleSubscriptionsCount = mergedMandates.filter((m) => m.threatType === 'DOUBLE_SUBSCRIPTION').length;
  const zombieChargesCount = mergedMandates.filter((m) => m.threatType === 'ZOMBIE_CHARGE').length;

  const stats: MandateRadarStats = {
    totalMandates: mergedMandates.length,
    totalAnnualBleed,
    totalMonthlyBleed,
    threatsCount,
    priceCreepsCount,
    trialTrapsCount,
    doubleSubscriptionsCount,
    zombieChargesCount,
    lastAuditedTimestamp: Date.now(),
  };

  return { mandates: mergedMandates, stats };
}
