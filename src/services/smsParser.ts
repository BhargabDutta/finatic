import { ParsedFinancialData, TransactionType, ExpenseCategory } from '../types/sms';

const KNOWN_MERCHANTS: { name: string; category: ExpenseCategory; pattern: RegExp }[] = [
  // Food & Dining
  { name: 'Swiggy', category: 'FOOD_DINING', pattern: /\b(swiggy|bundl\s*tech)\b/i },
  { name: 'Zomato', category: 'FOOD_DINING', pattern: /\b(zomato|blinkit)\b/i },
  { name: 'Starbucks', category: 'FOOD_DINING', pattern: /\bstarbucks\b/i },
  { name: "McDonald's", category: 'FOOD_DINING', pattern: /\bmcdonald'?s\b/i },
  { name: 'Uber Eats', category: 'FOOD_DINING', pattern: /\buber\s*eats\b/i },
  { name: 'DoorDash', category: 'FOOD_DINING', pattern: /\bdoordash\b/i },
  { name: 'Dominos', category: 'FOOD_DINING', pattern: /\bdomino'?s\b/i },
  { name: 'KFC', category: 'FOOD_DINING', pattern: /\bkfc\b/i },

  // Groceries
  { name: 'Zepto', category: 'GROCERIES', pattern: /\bzepto\b/i },
  { name: 'Blinkit', category: 'GROCERIES', pattern: /\bblinkit\b/i },
  { name: 'BigBasket', category: 'GROCERIES', pattern: /\bbigbasket\b/i },
  { name: 'Instamart', category: 'GROCERIES', pattern: /\binstamart\b/i },
  { name: 'Walmart', category: 'GROCERIES', pattern: /\bwalmart\b/i },
  { name: 'Target', category: 'GROCERIES', pattern: /\btarget\b/i },
  { name: 'Trader Joe', category: 'GROCERIES', pattern: /\btrader\s*joe\b/i },

  // Shopping & E-Commerce
  { name: 'Amazon', category: 'SHOPPING', pattern: /\bamazon(?:\.com|\.in)?\b/i },
  { name: 'Flipkart', category: 'SHOPPING', pattern: /\bflipkart\b/i },
  { name: 'Myntra', category: 'SHOPPING', pattern: /\bmyntra\b/i },
  { name: 'Apple', category: 'SHOPPING', pattern: /\bapple(?:\.com)?\b/i },
  { name: 'Zara', category: 'SHOPPING', pattern: /\bzara\b/i },
  { name: 'Nike', category: 'SHOPPING', pattern: /\bnike\b/i },

  // Travel & Transport
  { name: 'Uber', category: 'TRAVEL_TRANSPORT', pattern: /\buber(?!\s*eats)\b/i },
  { name: 'Ola Cabs', category: 'TRAVEL_TRANSPORT', pattern: /\bola\s*(?:cabs)?\b/i },
  { name: 'Lyft', category: 'TRAVEL_TRANSPORT', pattern: /\blyft\b/i },
  { name: 'Rapido', category: 'TRAVEL_TRANSPORT', pattern: /\brapido\b/i },
  { name: 'MakeMyTrip', category: 'TRAVEL_TRANSPORT', pattern: /\bmakemytrip\b/i },
  { name: 'IndiGo Airlines', category: 'TRAVEL_TRANSPORT', pattern: /\bindigo\b/i },
  { name: 'Shell Fuel', category: 'TRAVEL_TRANSPORT', pattern: /\bshell(?:\s*oil)?\b/i },
  { name: 'Fuel Station', category: 'TRAVEL_TRANSPORT', pattern: /\b(petrol|diesel|fuel|hpcl|bpcl|iocl)\b/i },

  // Entertainment & Subs
  { name: 'Netflix', category: 'ENTERTAINMENT', pattern: /\bnetflix\b/i },
  { name: 'Spotify', category: 'ENTERTAINMENT', pattern: /\bspotify\b/i },
  { name: 'BookMyShow', category: 'ENTERTAINMENT', pattern: /\bbookmyshow\b/i },
  { name: 'Disney+ Hotstar', category: 'ENTERTAINMENT', pattern: /\b(disney\+|hotstar)\b/i },
  { name: 'YouTube Premium', category: 'ENTERTAINMENT', pattern: /\byoutube(?:\s*premium)?\b/i },

  // Utilities & Telco
  { name: 'Airtel', category: 'UTILITIES_BILLS', pattern: /\bairtel\b/i },
  { name: 'Jio', category: 'UTILITIES_BILLS', pattern: /\b(?:reliance\s*)?jio\b/i },
  { name: 'Electricity Board', category: 'UTILITIES_BILLS', pattern: /\b(bescom|tata\s*power|electricity|power\s*corp)\b/i },

  // Investments
  { name: 'Zerodha', category: 'INVESTMENTS', pattern: /\bzerodha\b/i },
  { name: 'Groww', category: 'INVESTMENTS', pattern: /\bgroww\b/i },
  { name: 'Mutual Fund SIP', category: 'INVESTMENTS', pattern: /\b(mutual\s*fund|sip|demat|etf|nav)\b/i },
];

/**
 * Parses raw SMS text and metadata into high-confidence financial entities.
 */
export function parseSMS(body: string, address: string = ''): ParsedFinancialData {
  const cleanBody = body.replace(/[\r\n]+/g, ' ').trim();
  const lower = cleanBody.toLowerCase();

  // 1. Detect Bank or Sender Alphanumeric ID
  const bankOrSender = extractSenderOrBank(address, cleanBody);

  // 2. Check for OTP / 2FA Code First
  const isOtp = /otp|verification\s*code|one\s*time\s*password|secret\s*code|security\s*code|use\s*code\s*\d{4,8}/i.test(cleanBody) &&
                !/loan|offer|pre-approved/i.test(cleanBody);

  let otpCode: string | null = null;
  if (isOtp) {
    const otpMatch = cleanBody.match(/\b(\d{4,8})\b(?:\s*is\s*(?:your)?\s*(?:secret)?\s*otp|\s*is\s*your\s*verification\s*code|\s*to\s*verify)?/i);
    if (otpMatch) {
      otpCode = otpMatch[1];
    }
  }

  // 3. Detect Transaction Type
  let type: TransactionType = 'GENERAL_INFO';
  let isFinancial = false;

  if (isOtp) {
    type = 'OTP_AUTH';
    isFinancial = /amount|inr|rs\.?|\$|transaction/i.test(cleanBody);
  } else if (/congratulations|pre-approved|apply\s*now|discount\s*code|voucher|flat\s*\d+%\s*off|exclusive\s*offer|cash\s*prize/i.test(cleanBody)) {
    type = 'PROMOTIONAL';
  } else if (/mutual\s*fund|\bsip\b|demat|allotted\s*units|dividend|shares\s*credited|invested\s*in/i.test(cleanBody)) {
    type = 'INVESTMENT';
    isFinancial = true;
  } else if (/bill\s*due|due\s*date|statement\s*generated|total\s*(?:amount\s*)?due|minimum\s*(?:amount\s*)?due|payment\s*reminder/i.test(cleanBody)) {
    type = 'BILL_DUE';
    isFinancial = true;
  } else if (/debited|spent|paid|withdrawn|charged|sent\s*(?:rs|inr|\$)|swiped|purchase\s*of|debit\s*card/i.test(cleanBody)) {
    type = 'DEBIT';
    isFinancial = true;
  } else if (/credited|deposited|refund(?:ed)?|cashback|salary|received\s*(?:rs|inr|\$)/i.test(cleanBody)) {
    type = 'CREDIT';
    isFinancial = true;
  } else if (/balance\s*is|bal\s*inr|available\s*limit/i.test(cleanBody)) {
    type = 'GENERAL_INFO';
    isFinancial = true;
  }

  // 4. Extract Amount & Currency
  const { amount, currency, currencySymbol } = extractAmountAndCurrency(cleanBody);

  // If there's an amount and a bank sender, it's financial
  if (amount !== null && (type === 'DEBIT' || type === 'CREDIT' || type === 'BILL_DUE' || type === 'INVESTMENT')) {
    isFinancial = true;
  }

  // 5. Extract Account / Card Digits
  const accountDigits = extractAccountDigits(cleanBody);

  // 6. Extract Remaining Available Balance
  const balanceRemaining = extractAvailableBalance(cleanBody, amount);

  // 7. Extract Merchant / Payee
  const { merchant, category } = extractMerchantAndCategory(cleanBody, type);

  // 8. Extract Due Date (if BILL_DUE)
  const dueDate = extractDueDate(cleanBody);

  // 9. Extract Reference / UTR Number
  const referenceNumber = extractReferenceNumber(cleanBody);

  // Calculate Confidence Score
  let confidence = 50;
  if (amount !== null) confidence += 25;
  if (accountDigits) confidence += 10;
  if (merchant) confidence += 10;
  if (balanceRemaining !== null) confidence += 5;

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
    dueDate,
    otpCode,
    confidenceScore: Math.min(confidence, 100),
    isFinancial,
  };
}

function extractSenderOrBank(address: string, body: string): string {
  // Extract alphanumeric header (e.g., "VK-HDFCBK" -> "HDFC Bank")
  const senderUpper = address.toUpperCase();

  if (/HDFC/i.test(senderUpper) || /HDFC/i.test(body)) return 'HDFC Bank';
  if (/SBI/i.test(senderUpper) || /STATE BANK/i.test(body)) return 'State Bank of India';
  if (/ICICI/i.test(senderUpper) || /ICICI/i.test(body)) return 'ICICI Bank';
  if (/AXIS/i.test(senderUpper) || /AXIS/i.test(body)) return 'Axis Bank';
  if (/KOTAK/i.test(senderUpper) || /KOTAK/i.test(body)) return 'Kotak Bank';
  if (/CHASE/i.test(senderUpper) || /CHASE/i.test(body)) return 'Chase Bank';
  if (/WELLS/i.test(senderUpper) || /WELLS FARGO/i.test(body)) return 'Wells Fargo';
  if (/CITI/i.test(senderUpper) || /CITIBANK/i.test(body)) return 'Citi Bank';
  if (/BOA|AMER/i.test(senderUpper) || /BANK OF AMERICA/i.test(body)) return 'Bank of America';
  if (/AMEX/i.test(senderUpper) || /AMERICAN EXPRESS/i.test(body)) return 'American Express';
  if (/PAYTM/i.test(senderUpper)) return 'Paytm Payments';
  if (/PHONEPE/i.test(senderUpper)) return 'PhonePe';
  if (/GPAY/i.test(senderUpper)) return 'Google Pay';

  // Return clean address sender if present
  const cleaned = address.replace(/^[A-Z]{2}-/i, '');
  return cleaned.trim() || 'SMS Service';
}

function extractAmountAndCurrency(body: string): { amount: number | null; currency: string; currencySymbol: string } {
  // Pattern 1: Explicit currency symbol or code before digits
  // Exclude "avail bal: Rs. XXX" when searching for the primary txn amount
  const bodyWithoutBal = body.replace(
    /\b(?:avail(?:able)?\s*bal(?:ance)?|bal|balance|credit\s*limit)\b\s*[:\-]?\s*(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp)?\s*[0-9,]+(?:\.[0-9]{1,2})?/gi,
    ' '
  );

  const regexBefore = /(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;
  const matchBefore = bodyWithoutBal.match(regexBefore) || body.match(regexBefore);

  let amountStr: string | null = null;
  let currency = 'INR';
  let currencySymbol = '₹';

  if (matchBefore) {
    amountStr = matchBefore[1];
    const matchFull = matchBefore[0].toLowerCase();
    if (matchFull.includes('$') || matchFull.includes('usd')) {
      currency = 'USD';
      currencySymbol = '$';
    } else if (matchFull.includes('€') || matchFull.includes('eur')) {
      currency = 'EUR';
      currencySymbol = '€';
    } else if (matchFull.includes('£') || matchFull.includes('gbp')) {
      currency = 'GBP';
      currencySymbol = '£';
    } else {
      currency = 'INR';
      currencySymbol = '₹';
    }
  } else {
    // Pattern 2: Digits followed by currency code
    const regexAfter = /([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:inr|usd|eur|gbp)/i;
    const matchAfter = bodyWithoutBal.match(regexAfter) || body.match(regexAfter);
    if (matchAfter) {
      amountStr = matchAfter[1];
      const matchFull = matchAfter[0].toLowerCase();
      if (matchFull.includes('usd')) { currency = 'USD'; currencySymbol = '$'; }
      else if (matchFull.includes('eur')) { currency = 'EUR'; currencySymbol = '€'; }
      else if (matchFull.includes('gbp')) { currency = 'GBP'; currencySymbol = '£'; }
      else { currency = 'INR'; currencySymbol = '₹'; }
    }
  }

  if (amountStr) {
    const cleanNum = parseFloat(amountStr.replace(/,/g, ''));
    if (!isNaN(cleanNum)) {
      return { amount: cleanNum, currency, currencySymbol };
    }
  }

  return { amount: null, currency: 'INR', currencySymbol: '₹' };
}

function extractAccountDigits(body: string): string | null {
  const match = body.match(/(?:a\/c|acct|account|card)\s*(?:no\.?|ending|\*+|xx+|x+)?\s*[:\-]?\s*[*xX]*([0-9]{3,4})\b/i);
  return match ? `XX${match[1]}` : null;
}

function extractAvailableBalance(body: string, txnAmount: number | null): number | null {
  const match = body.match(/(?:avail(?:able)?\s*bal(?:ance)?|bal:?)\s*(?:is)?\s*(?:rs\.?|inr|₹|\$|usd|€|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (match) {
    const bal = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(bal) && bal !== txnAmount) {
      return bal;
    }
  }
  return null;
}

function extractDueDate(body: string): string | null {
  const match = body.match(/(?:due\s*(?:date|on|by)|before)\s*[:\-]?\s*([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?\s*[a-zA-Z]{3,9}(?:\s*'?\d{2,4})?|[a-zA-Z]{3,9}\s*[0-9]{1,2}(?:,\s*\d{4})?)/i);
  return match ? match[1].trim() : null;
}

function extractReferenceNumber(body: string): string | null {
  const match = body.match(/(?:upi\s*ref|ref\s*(?:no\.?|id)?|utr\s*(?:no\.?|id)?|txn\s*(?:id|#)?)\s*[:\-]?\s*([A-Za-z0-9]{6,22})/i);
  return match ? match[1] : null;
}

function extractMerchantAndCategory(
  body: string,
  type: TransactionType
): { merchant: string | null; category: ExpenseCategory } {
  // 1. Check known merchants list first
  for (const item of KNOWN_MERCHANTS) {
    if (item.pattern.test(body)) {
      return { merchant: item.name, category: item.category };
    }
  }

  // 2. Look for "at [Merchant]" pattern
  const atMatch = body.match(/\bat\s+([A-Za-z0-9\.\s&-]{2,25})(?:\s+on|\s+dated|\s+ref|\s+for|\.|\,|$)/i);
  if (atMatch) {
    const rawMerchant = atMatch[1].trim();
    if (!/credit\s*card|bank|account/i.test(rawMerchant)) {
      return { merchant: rawMerchant, category: 'OTHER' };
    }
  }

  // 3. Look for "to VPA [id]" or "to [Name]"
  const vpaMatch = body.match(/to\s+(?:VPA\s+)?([a-zA-Z0-9\._-]+@[a-zA-Z0-9]+)/i);
  if (vpaMatch) {
    const vpa = vpaMatch[1];
    return { merchant: vpa, category: 'OTHER' };
  }

  const toMatch = body.match(/to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:on|ref|via)/);
  if (toMatch) {
    return { merchant: toMatch[1].trim(), category: 'OTHER' };
  }

  // 4. Fallback categories based on type
  if (type === 'OTP_AUTH') return { merchant: null, category: 'SECURITY_AUTH' };
  if (type === 'PROMOTIONAL') return { merchant: null, category: 'PROMOTION_SPAM' };
  if (type === 'BILL_DUE') return { merchant: 'Utility / Card Issuer', category: 'UTILITIES_BILLS' };
  if (type === 'INVESTMENT') return { merchant: 'Investment Portfolio', category: 'INVESTMENTS' };
  if (type === 'CREDIT' && /salary|payroll|stipend/i.test(body)) return { merchant: 'Employer Payroll', category: 'SALARY_INCOME' };

  return { merchant: null, category: 'OTHER' };
}
