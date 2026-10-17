export type TransactionType =
  | 'DEBIT'
  | 'CREDIT'
  | 'BILL_DUE'
  | 'OTP_AUTH'
  | 'INVESTMENT'
  | 'PROMOTIONAL'
  | 'GENERAL_INFO';

export type ExpenseCategory =
  | 'FOOD_DINING'
  | 'SHOPPING'
  | 'UTILITIES_BILLS'
  | 'GROCERIES'
  | 'TRAVEL_TRANSPORT'
  | 'ENTERTAINMENT'
  | 'SALARY_INCOME'
  | 'INVESTMENTS'
  | 'HEALTHCARE'
  | 'FINANCE_FEES'
  | 'SECURITY_AUTH'
  | 'PROMOTION_SPAM'
  | 'OTHER';

export interface ParsedFinancialData {
  amount: number | null;
  currency: string;
  currencySymbol: string;
  type: TransactionType;
  category: ExpenseCategory;
  merchant: string | null;
  bankOrSender: string;
  accountDigits: string | null;
  balanceRemaining: number | null;
  referenceNumber: string | null;
  dueDate: string | null;
  otpCode: string | null;
  confidenceScore: number; // 0 - 100
  isFinancial: boolean;
}

export interface SMSMessage {
  id: string;
  address: string;
  body: string;
  date: number; // timestamp ms
  read?: boolean;
  parsed: ParsedFinancialData;
  isSimulated?: boolean;
}

export interface ScanStats {
  totalMessages: number;
  financialCount: number;
  debitTotal: number;
  creditTotal: number;
  billDueTotal: number;
  netFlow: number;
  lastScanTimestamp: number;
  categoryTotals: Record<ExpenseCategory, number>;
  typeDistribution: Record<TransactionType, number>;
}

export type FilterCategory =
  | 'ALL'
  | 'DEBIT'
  | 'CREDIT'
  | 'BILL_DUE'
  | 'OTP_AUTH'
  | 'INVESTMENT'
  | 'PROMOTIONAL';

export type SortOrder = 'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW';
