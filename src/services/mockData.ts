import { SMSMessage } from '../types/sms';
import { parseSMS } from './smsParser';

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

interface RawMockSMS {
  id: string;
  address: string;
  body: string;
  dateOffset: number;
}

/**
 * PURE AUTO-PAYMENT MANDATE DATASET:
 * Authentic Indian banking SMS containing ONLY recurring mandates, UPI AutoPay,
 * Card Standing Instructions, NACH e-mandates, and Pre-Debit alerts.
 * Zero OTPs, zero personal transfers, zero everyday retail POS swipes.
 */
const RAW_MOCK_DATA: RawMockSMS[] = [
  {
    id: 'sms-mandate-01',
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Rs. 649.00 debited from A/c **1234 towards UPI AutoPay mandate for NETFLIX ENTERTAINMENT. UMRN: UMRN99482187. Avail Bal: Rs 48,200.50.',
    dateOffset: 12 * minute,
  },
  {
    id: 'sms-mandate-02',
    address: 'AX-AXISBK',
    body: 'Axis Bank: Standing Instruction of Rs. 899.00 executed on Credit Card ending 5678 for CANVA PRO. Next auto-debit on 17-Nov-26. Ref: SI-AXIS-CANVA.',
    dateOffset: 45 * minute,
  },
  {
    id: 'sms-mandate-03',
    address: 'AX-ICICIB',
    body: 'ICICI Bank: Auto-debit of Rs 1,750.00 processed via NACH mandate UMRN11928374 towards CULT FIT HEALTHCARE. Avail Bal: Rs 42,100.',
    dateOffset: 2 * hour,
  },
  {
    id: 'sms-mandate-04',
    address: 'VK-HDFCBK',
    body: 'Pre-debit Notification: Rs. 299.00 will be auto-debited on 18-Oct-26 for recurring mandate SI-HDFC-HOTSTAR on Card **1234 for Disney+ Hotstar.',
    dateOffset: 4 * hour,
  },
  {
    id: 'sms-mandate-05',
    address: 'AX-ICICIB',
    body: 'UPI AutoPay Alert: Rs. 119.00 successfully debited from ICICI A/c **9012 for SPOTIFY PREMIUM INDIA. Mandate ID: MAN66718293. Ref: UPI/88921104.',
    dateOffset: 14 * hour,
  },
  {
    id: 'sms-mandate-06',
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Auto-debit Rs. 1,179.00 towards JIO FIBER recurring mandate executed on A/c **1234. Mandate ID: MAN88920194.',
    dateOffset: 1 * day + 2 * hour,
  },
  {
    id: 'sms-mandate-07',
    address: 'AX-AXISBK',
    body: 'Axis Bank Alert: Recurring Standing Instruction of Rs. 1,499.00 auto-debited on Card **5678 for AMAZON PRIME ANNUAL. Next debit Oct-2027.',
    dateOffset: 2 * day + 5 * hour,
  },
  {
    id: 'sms-mandate-08',
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Monthly standing instruction of Rs. 540.00 processed on Card ending 1234 for AWS CLOUD USAGE. Ref: SI-HDFC-AWS-CLOUD.',
    dateOffset: 3 * day + 8 * hour,
  },
];

export function getMockSMSMessages(): SMSMessage[] {
  return RAW_MOCK_DATA.map((item) => ({
    id: item.id,
    address: item.address,
    body: item.body,
    date: now - item.dateOffset,
    read: true,
    parsed: parseSMS(item.body, item.address),
    isSimulated: false,
  }));
}

const REALTIME_SIMULATION_TEMPLATES = [
  {
    address: 'AX-ICICIB',
    body: 'Pre-debit Notification: Rs. 89.00 will be auto-debited on 20-Oct-26 for recurring mandate for APPLE ICLOUD on Card **9012.',
  },
  {
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Rs. 129.00 debited from A/c **1234 towards UPI AutoPay mandate for YOUTUBE PREMIUM. UMRN: UMRN77812903.',
  },
  {
    address: 'AX-AXISBK',
    body: 'Axis Bank: Standing Instruction executed for Rs. 500.00 on Card **5678 towards GOOGLE ONE STORAGE. Mandate ID: MAN55102938.',
  },
];

let simCounter = 0;

export function generateRandomIncomingSMS(): SMSMessage {
  const template = REALTIME_SIMULATION_TEMPLATES[simCounter % REALTIME_SIMULATION_TEMPLATES.length];
  simCounter++;

  const id = `sms-sim-${Date.now()}-${simCounter}`;
  const date = Date.now();

  return {
    id,
    address: template.address,
    body: template.body,
    date,
    read: false,
    parsed: parseSMS(template.body, template.address),
    isSimulated: true,
  };
}
