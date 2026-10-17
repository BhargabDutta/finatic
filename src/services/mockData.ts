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

const RAW_MOCK_DATA: RawMockSMS[] = [
  {
    id: 'sms-001',
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Rs. 1,420.00 debited from A/c **4029 on 17-OCT-26 to VPA swiggy@icici (UPI Ref 429103940192). Avail Bal: Rs 48,200.50.',
    dateOffset: 4 * minute,
  },
  {
    id: 'sms-002',
    address: 'CHASE',
    body: 'Chase: You made a $42.50 debit card transaction with STARBUCKS on Oct 17. Avail Bal: $1,280.40.',
    dateOffset: 18 * minute,
  },
  {
    id: 'sms-003',
    address: 'AX-ICICIB',
    body: 'Alert: Rs 899.00 spent on your ICICI Bank Credit Card ending 3014 at NETFLIX on 17-Oct-26. Avail Limit: Rs 1,45,000.',
    dateOffset: 45 * minute,
  },
  {
    id: 'sms-004',
    address: 'JD-AIRTEL',
    body: 'Bill payment reminder: Your Airtel Fiber broadband bill of Rs. 1,179.00 is due on 22-OCT-26. Pay now to avoid disconnection.',
    dateOffset: 2 * hour,
  },
  {
    id: 'sms-005',
    address: 'VK-HDFCBK',
    body: 'Dear Customer, INR 85,000.00 credited to your A/C XX4029 on 16-OCT-26 by SALARY/TECH GLOBAL CORP. Available Bal: INR 1,32,400.00.',
    dateOffset: 14 * hour,
  },
  {
    id: 'sms-006',
    address: 'WELLSFARGO',
    body: 'Wells Fargo: $149.99 was charged on Card ending in 4432 at AMAZON.COM on 16-Oct. Remaining Bal: $3,450.00.',
    dateOffset: 16 * hour,
  },
  {
    id: 'sms-007',
    address: 'VM-ZEPTO',
    body: 'Your Zepto order #ZP88219 of Rs. 640.00 is placed! Paid via UPI Ref 908129410. Delivery in 7 mins.',
    dateOffset: 19 * hour,
  },
  {
    id: 'sms-008',
    address: 'VK-HDFCBK',
    body: '392019 is your secret OTP for transaction of INR 3,250.00 at ZARA on HDFC Card XX4029. Valid for 5 mins. Do not share with anyone.',
    dateOffset: 22 * hour,
  },
  {
    id: 'sms-009',
    address: 'CITIBK',
    body: 'Citi Alert: Card ending 9921 was charged USD 68.00 at SHELL OIL on 15-Oct. Contact if unauthorized.',
    dateOffset: 1 * day + 2 * hour,
  },
  {
    id: 'sms-010',
    address: 'SBIINB',
    body: 'SBI Alert: Rs 350.00 debited from A/C 9876 on 15-OCT-26. Info: UBER TRIP (Ref 491029419). Avail Bal: Rs 19,450.00.',
    dateOffset: 1 * day + 5 * hour,
  },
  {
    id: 'sms-011',
    address: 'VK-HDFCBK',
    body: 'Your HDFC Bank Credit Card ending 4029 statement generated. Total Due: Rs 14,820.00. Min Due: Rs 1,200.00. Due Date: 28-OCT-26.',
    dateOffset: 1 * day + 12 * hour,
  },
  {
    id: 'sms-012',
    address: 'AX-ZERODHA',
    body: 'Zerodha: SIP executed! Rs 5,000 invested in NIPPON INDIA GROWTH FUND on 14-OCT-26. Units allotted: 45.28 at NAV Rs 110.42.',
    dateOffset: 2 * day + 3 * hour,
  },
  {
    id: 'sms-013',
    address: 'AMEX',
    body: 'American Express: Payment of USD 450.00 received for Card ending -31004. Thank you for your payment.',
    dateOffset: 2 * day + 8 * hour,
  },
  {
    id: 'sms-014',
    address: 'VM-SWIGGY',
    body: 'Cravings alert! 🍔 Flat 50% OFF on your favorite Biryani today. Use coupon CRAVE50 at checkout. Hurry!',
    dateOffset: 2 * day + 14 * hour,
  },
  {
    id: 'sms-015',
    address: 'VK-KOTAK',
    body: 'Kotak Bank: Rs 2,500.00 received in A/c XX8192 from John Doe via UPI Ref 891029384910.',
    dateOffset: 3 * day,
  },
  {
    id: 'sms-016',
    address: 'CHASE',
    body: 'Chase: Your credit card statement is ready. Total minimum payment of $120.00 is due on Oct 25.',
    dateOffset: 3 * day + 4 * hour,
  },
  {
    id: 'sms-017',
    address: 'VK-HDFCBK',
    body: 'Alert: Rs 5,499.00 spent on HDFC Card **4029 at APPLE.COM on 12-OCT-26. Available limit: Rs 1,39,500.',
    dateOffset: 4 * day,
  },
  {
    id: 'sms-018',
    address: 'VM-BAJAJ',
    body: 'Pre-approved Personal Loan of Rs. 5,00,000/- waiting for you with zero processing fee! Click to disburse instantly.',
    dateOffset: 4 * day + 6 * hour,
  },
  {
    id: 'sms-019',
    address: 'SBIINB',
    body: 'Dear SBI Customer, OTP for login to SBI YONO is 849201. Never share this code with anyone including bank officials.',
    dateOffset: 5 * day,
  },
  {
    id: 'sms-020',
    address: 'VK-HDFCBK',
    body: 'HDFC Bank: Rs 2,100.00 debited from A/c **4029 on 10-OCT-26 at BLINKIT. Ref: BLK99482. Avail Bal: Rs 52,100.00.',
    dateOffset: 6 * day,
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
    isSimulated: true,
  }));
}

/**
 * Generates a realistic live incoming SMS to demonstrate real-time scanner reactivity
 */
export function generateRandomIncomingSMS(): SMSMessage {
  const templates = [
    {
      address: 'VK-HDFCBK',
      body: `HDFC Bank: Rs. ${(Math.floor(Math.random() * 800) + 120)}.00 debited from A/c **4029 on just now to VPA swiggy@icici (UPI Ref ${Math.floor(100000000000 + Math.random() * 900000000000)}). Avail Bal: Rs 46,780.00.`,
    },
    {
      address: 'CHASE',
      body: `Chase: You made a $${(Math.random() * 45 + 5).toFixed(2)} debit card transaction with STARBUCKS on just now. Avail Bal: $1,237.90.`,
    },
    {
      address: 'AX-ICICIB',
      body: `Alert: Rs ${(Math.floor(Math.random() * 2500) + 400)}.00 spent on ICICI Bank Credit Card ending 3014 at AMAZON on just now. Avail Limit: Rs 1,42,100.`,
    },
    {
      address: 'VK-HDFCBK',
      body: `${Math.floor(100000 + Math.random() * 900000)} is your secret OTP for transaction on HDFC Card. Valid for 5 mins. Do not share.`,
    },
    {
      address: 'SBIINB',
      body: `SBI Alert: Rs ${(Math.floor(Math.random() * 500) + 100)}.00 debited from A/C 9876. Info: UBER TRIP (Ref ${Math.floor(1000000000 + Math.random() * 9000000000)}).`,
    },
    {
      address: 'VK-KOTAK',
      body: `Kotak Bank: INR ${(Math.floor(Math.random() * 4000) + 500)}.00 credited to A/c XX8192 via UPI from Friend (Ref ${Math.floor(100000000000 + Math.random() * 900000000000)}).`,
    },
  ];

  const pick = templates[Math.floor(Math.random() * templates.length)];
  const id = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    address: pick.address,
    body: pick.body,
    date: Date.now(),
    read: true,
    parsed: parseSMS(pick.body, pick.address),
    isSimulated: true,
  };
}
