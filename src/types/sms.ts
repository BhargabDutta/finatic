export type TransactionType =
  | 'UPI_AUTOPAY'
  | 'CARD_SI'
  | 'NACH_ECS'
  | 'PRE_DEBIT_ALERT'
  | 'RECURRING_SUB';

export type ExpenseCategory =
  | 'ENTERTAINMENT'
  | 'PRODUCTIVITY_TOOLS'
  | 'HEALTH_FITNESS'
  | 'UTILITIES_BILLS'
  | 'CLOUD_INFRA'
  | 'INSURANCE_EMI'
  | 'INVESTMENTS'
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
  mandateReference: string | null; // UMRN or Mandate Ref
  isPreDebitNotification: boolean;
  dueDate: string | null;
  confidenceScore: number; // 0 - 100
  isAutoPayment: boolean;
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
  | 'UPI_AUTOPAY'
  | 'CARD_SI'
  | 'NACH_ECS'
  | 'PRE_DEBIT_ALERT';

export type SortOrder = 'NEWEST' | 'OLDEST' | 'AMOUNT_HIGH' | 'AMOUNT_LOW';
