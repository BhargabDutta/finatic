import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSMessage, ScanStats, ExpenseCategory, TransactionType } from '../types/sms';
import { getMockSMSMessages } from './mockData';

const STORAGE_KEYS = {
  MESSAGES: '@finatic_autopay_mandates_v2',
  LAST_SCAN: '@finatic_autopay_last_scan',
  INITIALIZED: '@finatic_autopay_init_v2',
};

const DEFAULT_CATEGORY_TOTALS: Record<ExpenseCategory, number> = {
  ENTERTAINMENT: 0,
  PRODUCTIVITY_TOOLS: 0,
  HEALTH_FITNESS: 0,
  UTILITIES_BILLS: 0,
  CLOUD_INFRA: 0,
  INSURANCE_EMI: 0,
  INVESTMENTS: 0,
  OTHER: 0,
};

const DEFAULT_TYPE_DISTRIBUTION: Record<TransactionType, number> = {
  UPI_AUTOPAY: 0,
  CARD_SI: 0,
  NACH_ECS: 0,
  PRE_DEBIT_ALERT: 0,
  RECURRING_SUB: 0,
};

export async function getStoredSMSMessages(): Promise<SMSMessage[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!json) {
      // First run: populate with pure auto-payment dataset
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
  const updated = [message, ...current.filter((m) => m.id !== message.id)];
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
    const { type, category, amount, isAutoPayment } = msg.parsed;

    typeDistribution[type] = (typeDistribution[type] || 0) + 1;

    if (isAutoPayment) {
      financialCount++;
    }

    if (amount !== null && amount > 0) {
      if (type === 'PRE_DEBIT_ALERT') {
        billDueTotal += amount;
      } else {
        debitTotal += amount;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    }
  }

  const netFlow = -debitTotal;

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
