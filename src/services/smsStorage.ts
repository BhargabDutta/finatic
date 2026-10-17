import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSMessage, ScanStats, ExpenseCategory, TransactionType } from '../types/sms';
import { getMockSMSMessages } from './mockData';

const STORAGE_KEYS = {
  MESSAGES: '@finatic_sms_messages_v1',
  LAST_SCAN: '@finatic_last_scan_timestamp',
  INITIALIZED: '@finatic_initialized_v1',
};

const DEFAULT_CATEGORY_TOTALS: Record<ExpenseCategory, number> = {
  FOOD_DINING: 0,
  SHOPPING: 0,
  UTILITIES_BILLS: 0,
  GROCERIES: 0,
  TRAVEL_TRANSPORT: 0,
  ENTERTAINMENT: 0,
  SALARY_INCOME: 0,
  INVESTMENTS: 0,
  HEALTHCARE: 0,
  FINANCE_FEES: 0,
  SECURITY_AUTH: 0,
  PROMOTION_SPAM: 0,
  OTHER: 0,
};

const DEFAULT_TYPE_DISTRIBUTION: Record<TransactionType, number> = {
  DEBIT: 0,
  CREDIT: 0,
  BILL_DUE: 0,
  OTP_AUTH: 0,
  INVESTMENT: 0,
  PROMOTIONAL: 0,
  GENERAL_INFO: 0,
};

export async function getStoredSMSMessages(): Promise<SMSMessage[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!json) {
      // First run: populate with rich mock data
      const initial = getMockSMSMessages();
      await saveSMSMessages(initial);
      await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return initial;
    }
    const parsed: SMSMessage[] = JSON.parse(json);
    return parsed.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('Failed to load SMS messages from storage:', error);
    return getMockSMSMessages();
  }
}

export async function saveSMSMessages(messages: SMSMessage[]): Promise<void> {
  try {
    const json = JSON.stringify(messages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, json);
  } catch (error) {
    console.error('Failed to save SMS messages:', error);
  }
}

export async function addSMSMessage(message: SMSMessage): Promise<SMSMessage[]> {
  const current = await getStoredSMSMessages();
  // Prevent duplicate ID
  const filtered = current.filter((m) => m.id !== message.id);
  const updated = [message, ...filtered];
  await saveSMSMessages(updated);
  return updated;
}

export async function getLastScanTimestamp(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN);
    return val ? parseInt(val, 10) : Date.now();
  } catch {
    return Date.now();
  }
}

export async function setLastScanTimestamp(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN, timestamp.toString());
  } catch (error) {
    console.error('Failed to set last scan timestamp:', error);
  }
}

export async function resetToDefaultMockData(): Promise<SMSMessage[]> {
  const mock = getMockSMSMessages();
  await saveSMSMessages(mock);
  await setLastScanTimestamp(Date.now());
  return mock;
}

export function computeScanStats(messages: SMSMessage[], lastScanTime: number): ScanStats {
  let debitTotal = 0;
  let creditTotal = 0;
  let billDueTotal = 0;
  let financialCount = 0;

  const categoryTotals: Record<ExpenseCategory, number> = { ...DEFAULT_CATEGORY_TOTALS };
  const typeDistribution: Record<TransactionType, number> = { ...DEFAULT_TYPE_DISTRIBUTION };

  for (const msg of messages) {
    const { type, category, amount, isFinancial } = msg.parsed;

    typeDistribution[type] = (typeDistribution[type] || 0) + 1;

    if (isFinancial) {
      financialCount++;
    }

    if (amount !== null && amount > 0) {
      if (type === 'DEBIT') {
        debitTotal += amount;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      } else if (type === 'CREDIT') {
        creditTotal += amount;
      } else if (type === 'BILL_DUE') {
        billDueTotal += amount;
      }
    }
  }

  const netFlow = creditTotal - debitTotal;

  return {
    totalMessages: messages.length,
    financialCount,
    debitTotal,
    creditTotal,
    billDueTotal,
    netFlow,
    lastScanTimestamp: lastScanTime,
    categoryTotals,
    typeDistribution,
  };
}
