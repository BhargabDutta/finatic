import { ParsedFinancialData, TransactionType, ExpenseCategory } from '../types/sms';

const RECURRING_MERCHANTS: { name: string; category: ExpenseCategory; pattern: RegExp }[] = [
  { name: 'Netflix', category: 'ENTERTAINMENT', pattern: /\b(netflix|nflx)\b/i },
  { name: 'Canva Pro', category: 'PRODUCTIVITY_TOOLS', pattern: /\b(canva|canva\s*sub)\b/i },
  { name: 'Disney+ Hotstar', category: 'ENTERTAINMENT', pattern: /\b(disney\+|hotstar|disneyhotstar)\b/i },
  { name: 'Cult.fit', category: 'HEALTH_FITNESS', pattern: /\b(cult\s*\.?fit|cure\s*\.?fit)\b/i },
  { name: 'Spotify Premium', category: 'ENTERTAINMENT', pattern: /\b(spotify)\b/i },
  { name: 'Jio Fiber', category: 'UTILITIES_BILLS', pattern: /\b(jio\s*fiber|reliance\s*jio|jio\s*infocomm)\b/i },
  { name: 'Amazon Prime', category: 'ENTERTAINMENT', pattern: /\b(amazon\s*prime|prime\s*video|prime\s*member)\b/i },
  { name: 'AWS Cloud', category: 'CLOUD_INFRA', pattern: /\b(amazon\s*web\s*services|aws|aws\s*cloud)\b/i },
  { name: 'Google One / YouTube', category: 'CLOUD_INFRA', pattern: /\b(google\s*one|google\s*storage|youtube\s*premium|google\s*play)\b/i },
  { name: 'Apple Services', category: 'ENTERTAINMENT', pattern: /\b(apple\s*music|icloud|apple\.com\/bill)\b/i },
  { name: 'Airtel Broadband', category: 'UTILITIES_BILLS', pattern: /\b(airtel\s*broadband|airtel\s*fiber|airtel\s*autopay)\b/i },
  { name: 'HDFC Ergo / Life', category: 'INSURANCE_EMI', pattern: /\b(hdfc\s*life|hdfc\s*ergo|max\s*life|lic|insurance)\b/i },
  { name: 'Mutual Fund SIP', category: 'INVESTMENTS', pattern: /\b(sip|mutual\s*fund|zerodha|groww|nippon|hdfc\s*amc)\b/i },
];

/**
 * STRICT PRIVACY SHIELD:
 * Determines if an incoming SMS is genuinely an Auto-Payment or Recurring Mandate.
 * Explicitly rejects:
 * - OTPs and two-factor authentication codes
 * - Personal P2P peer-to-peer transfers (e.g. transfers to friends/family)
 * - One-time everyday merchant swipes (grocery, restaurant, retail POS)
 * - Promotional spam, loan advertisements, telco alerts
 */
export function isAutoPaymentSMS(body: string, _address: string = ''): boolean {
  const cleanBody = body.replace(/[\r\n]+/g, ' ').trim();

  // 1. HARD REJECT: OTPs, 2FA, Secret Codes, Verification Numbers
  if (
    /\b(otp|verification\s*code|one\s*time\s*password|secret\s*code|security\s*code|use\s*code\s*\d{4,8})\b/i.test(
      cleanBody
    )
  ) {
    return false;
  }

  // 2. HARD REJECT: Promotional spam, loan approvals, discount codes
  if (
    /\b(congratulations|pre-approved|apply\s*now|discount\s*code|voucher|flat\s*\d+%\s*off|exclusive\s*offer|cash\s*prize)\b/i.test(
      cleanBody
    )
  ) {
    return false;
  }

  // 3. HARD REJECT: Pure Personal P2P Transfers (without mandate/autopay keywords)
  const isP2P =
    /\b(sent\s*to\s*[a-zA-Z]+\s*via\s*upi|transferred\s*to\s*vpa|fund\s*transfer\s*to\s*account|paid\s*to\s*[a-zA-Z]+\s*using\s*upi)\b/i.test(
      cleanBody
    );
  const hasMandateKeyword =
    /\b(autopay|auto-pay|mandate|standing\s*instruction|si|nach|recurring|subscription)\b/i.test(
      cleanBody
    );

  if (isP2P && !hasMandateKeyword) {
    return false;
  }

  // 4. HARD REJECT: One-time physical POS card swipes without recurring context
  if (
    /\b(swiped\s*at|pos\s*transaction|store\s*purchase|terminal\s*txn)\b/i.test(cleanBody) &&
    !hasMandateKeyword
  ) {
    return false;
  }

  // 5. POSITIVE MATCH: Must explicitly contain Auto-Payment / Mandate patterns
  const isUPIAutoPay = /\b(autopay|auto-pay|upi\s*autopay|upi\s*mandate|recurring\s*mandate)\b/i.test(
    cleanBody
  );
  const isStandingInstruction = /\b(standing\s*instruction|si\s*debit|si-hdfc|si-icici|si-axis|si-sbi|card\s*si|e-mandate|emandate)\b/i.test(
    cleanBody
  );
  const isNACHorECS = /\b(nach|e-nach|enach|ecs|auto\s*clearing|national\s*automated\s*clearing)\b/i.test(
    cleanBody
  );
  const isRecurringBilling = /\b(recurring\s*(?:charge|debit|payment|bill)|auto\s*debit(?:ed)?|auto\s*renew(?:ed|al)?|subscription\s*renew(?:ed|al)?)\b/i.test(
    cleanBody
  );
  const isPreDebitNotice = /\b(pre-debit\s*notification|mandate\s*execution|scheduled\s*auto(?:-)?debit|will\s*be\s*auto(?:-)?debited)\b/i.test(
    cleanBody
  );
  const hasUMRN = /\b(umrn[0-9a-zA-Z]+|mandate\s*(?:id|ref|no))\b/i.test(cleanBody);

  return (
    isUPIAutoPay ||
    isStandingInstruction ||
    isNACHorECS ||
    isRecurringBilling ||
    isPreDebitNotice ||
    hasUMRN
  );
}

/**
 * Parses raw auto-payment SMS into structured recurring financial entities.
 */
export function parseSMS(body: string, address: string = ''): ParsedFinancialData {
  const cleanBody = body.replace(/[\r\n]+/g, ' ').trim();

  // 1. Detect Bank or Financial Institution Sender
  const bankOrSender = extractSenderOrBank(address, cleanBody);

  // 2. Classify Auto-Payment Rail & Notification Type
  const isPreDebit = /\b(pre-debit\s*notification|will\s*be\s*auto(?:-)?debited|scheduled\s*for\s*auto(?:-)?debit)\b/i.test(
    cleanBody
  );
  const isUPI = /\b(upi\s*autopay|autopay|upi\s*mandate)\b/i.test(cleanBody);
  const isSI = /\b(standing\s*instruction|si\s*debit|si-|card\s*si)\b/i.test(cleanBody);
  const isNACH = /\b(nach|e-nach|enach|ecs)\b/i.test(cleanBody);

  let type: TransactionType = 'RECURRING_SUB';
  if (isPreDebit) {
    type = 'PRE_DEBIT_ALERT';
  } else if (isUPI) {
    type = 'UPI_AUTOPAY';
  } else if (isSI) {
    type = 'CARD_SI';
  } else if (isNACH) {
    type = 'NACH_ECS';
  }

  // 3. Extract Amount & Currency
  const { amount, currency, currencySymbol } = extractAmountAndCurrency(cleanBody);

  // 4. Extract Account / Card Digits
  const accountDigits = extractAccountDigits(cleanBody);

  // 5. Extract Remaining Balance (if reported)
  const balanceRemaining = extractAvailableBalance(cleanBody, amount);

  // 6. Extract Canonical Merchant & Category
  const { merchant, category } = extractMerchantAndCategory(cleanBody);

  // 7. Extract Due Date / Next Debit Date
  const dueDate = extractDueDate(cleanBody);

  // 8. Extract Mandate Reference / UMRN
  const mandateReference = extractMandateReference(cleanBody);

  // 9. Extract Reference / UTR Number
  const referenceNumber = extractReferenceNumber(cleanBody);

  // Calculate High-Confidence Score
  let confidence = 60;
  if (amount !== null) confidence += 20;
  if (mandateReference) confidence += 10;
  if (merchant) confidence += 10;

  return {
    amount,
    currency,
    currencySymbol,
    type,
    category,
    merchant,
    bankOrSender,
    accountDigits,
    balanceRemaining,
    referenceNumber,
    mandateReference,
    isPreDebitNotification: isPreDebit,
    dueDate,
    confidenceScore: Math.min(confidence, 100),
    isAutoPayment: true,
  };
}

function extractMandateReference(body: string): string | null {
  // Matches UMRN (e.g. UMRN99482187) or Mandate ID
  const umrnMatch = body.match(/\b(UMRN[0-9A-Z]{6,20})\b/i);
  if (umrnMatch) return umrnMatch[1].toUpperCase();

  const idMatch = body.match(/(?:mandate\s*(?:id|ref|no)[\s:]+)([A-Z0-9_-]{6,24})/i);
  if (idMatch) return idMatch[1].toUpperCase();

  const siMatch = body.match(/(SI-[A-Z0-9_-]+)/i);
  if (siMatch) return siMatch[1].toUpperCase();

  return null;
}

function extractSenderOrBank(address: string, body: string): string {
  const senderUpper = address.toUpperCase();

  if (/HDFC/i.test(senderUpper) || /HDFC/i.test(body)) return 'HDFC Bank';
  if (/SBI/i.test(senderUpper) || /STATE BANK/i.test(body)) return 'State Bank of India';
  if (/ICICI/i.test(senderUpper) || /ICICI/i.test(body)) return 'ICICI Bank';
  if (/AXIS/i.test(senderUpper) || /AXIS/i.test(body)) return 'Axis Bank';
  if (/KOTAK/i.test(senderUpper) || /KOTAK/i.test(body)) return 'Kotak Mahindra';
  if (/CHASE/i.test(senderUpper) || /CHASE/i.test(body)) return 'Chase Bank';
  if (/CITI/i.test(senderUpper) || /CITI/i.test(body)) return 'Citibank';
  if (/WELLS/i.test(senderUpper) || /WELLS/i.test(body)) return 'Wells Fargo';
  if (/BOB/i.test(senderUpper) || /BANK OF BARODA/i.test(body)) return 'Bank of Baroda';
  if (/PNB/i.test(senderUpper) || /PUNJAB NATIONAL/i.test(body)) return 'PNB';

  if (address && address.length > 2) {
    const clean = address.replace(/^[A-Z]{2}-/i, '');
    return clean.toUpperCase();
  }

  return 'Authorized Bank';
}

function extractAmountAndCurrency(body: string): {
  amount: number | null;
  currency: string;
  currencySymbol: string;
} {
  const inrMatch = body.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (inrMatch) {
    const num = parseFloat(inrMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      return { amount: num, currency: 'INR', currencySymbol: '₹' };
    }
  }

  const usdMatch = body.match(/(?:\$|usd)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (usdMatch) {
    const num = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      return { amount: num, currency: 'USD', currencySymbol: '$' };
    }
  }

  const genericMatch = body.match(/\b(?:debited|spent|charged|for)\s+([\d,]+(?:\.\d{2})?)\b/i);
  if (genericMatch) {
    const num = parseFloat(genericMatch[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) {
      return { amount: num, currency: 'INR', currencySymbol: '₹' };
    }
  }

  return { amount: null, currency: 'INR', currencySymbol: '₹' };
}

function extractAccountDigits(body: string): string | null {
  const accMatch = body.match(/(?:a\/c|acct|account|card|ending(?:\s+in)?)\s*(?:no\.?)?\s*[*Xx]*(\d{4})/i);
  if (accMatch) return `..${accMatch[1]}`;

  const altMatch = body.match(/[*Xx]{2,}(\d{4})/);
  if (altMatch) return `..${altMatch[1]}`;

  return null;
}

function extractAvailableBalance(body: string, currentAmount: number | null): number | null {
  const balMatch = body.match(/(?:avail(?:able)?\s*(?:bal(?:ance)?|limit)|bal(?:\s*is)?)[:\s]+(?:rs\.?|inr|₹|\$)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (balMatch) {
    const val = parseFloat(balMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val !== currentAmount) {
      return val;
    }
  }
  return null;
}

function extractMerchantAndCategory(body: string): {
  merchant: string | null;
  category: ExpenseCategory;
} {
  for (const m of RECURRING_MERCHANTS) {
    if (m.pattern.test(body)) {
      return { merchant: m.name, category: m.category };
    }
  }

  // Regex patterns to capture merchant name following common auto-payment phrases
  const merchantRegexes = [
    /(?:mandate\s*for|towards\s*mandate|auto-debit\s*for|mandate\s*to)\s+([A-Za-z0-9&.\-_ ]{3,25})/i,
    /(?:at|to|for)\s+([A-Za-z0-9&.\-_ ]{3,20})\s+(?:on|via|ref|umrn)/i,
    /(?:standing\s*instruction\s*on\s*credit\s*card\s*ending\s*\d{4}\s*for)\s+([A-Za-z0-9&.\-_ ]{3,20})/i,
  ];

  for (const regex of merchantRegexes) {
    const match = body.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!/^(the|a|an|your|account|card|rs|inr|date|ending)$/i.test(candidate)) {
        return { merchant: candidate, category: 'OTHER' };
      }
    }
  }

  return { merchant: null, category: 'OTHER' };
}

function extractDueDate(body: string): string | null {
  const dueMatch = body.match(/(?:due\s*(?:on|date)?|scheduled\s*(?:on|for))[:\s]+(\d{1,2}[-\/][A-Za-z0-9]{3,}[-\/]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (dueMatch) return dueMatch[1].toUpperCase();
  return null;
}

function extractReferenceNumber(body: string): string | null {
  const refMatch = body.match(/(?:ref\s*(?:no\.?)?|txn\s*(?:id|no\.?)?|rrn)[:\s]+([A-Za-z0-9\-_]{6,20})/i);
  if (refMatch) return refMatch[1];
  return null;
}
