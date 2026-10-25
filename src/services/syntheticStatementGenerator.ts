import { DebitEvent } from '../types/mandate';

export interface SyntheticStatementRecord {
  id: string;
  date: string; // YYYY-MM-DD
  account: string;
  bank: string;
  rawDescriptor: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  balanceAfter: number;
  isRecurringMandate: boolean;
  notes?: string;
}

export function generate12MonthSyntheticStatement(): SyntheticStatementRecord[] {
  const records: SyntheticStatementRecord[] = [];
  let balance = 145000;
  let counter = 1;

  const months = [
    { year: 2026, month: '01', days: 31 },
    { year: 2026, month: '02', days: 28 },
    { year: 2026, month: '03', days: 31 },
    { year: 2026, month: '04', days: 30 },
    { year: 2026, month: '05', days: 31 },
    { year: 2026, month: '06', days: 30 },
    { year: 2026, month: '07', days: 31 },
    { year: 2026, month: '08', days: 31 },
    { year: 2026, month: '09', days: 30 },
    { year: 2026, month: '10', days: 31 },
    { year: 2026, month: '11', days: 30 },
    { year: 2026, month: '12', days: 31 },
  ];

  // Accounts
  const ACC_HDFC_SALARY = 'HDFC Bank (..1234)';
  const ACC_AXIS_CARD = 'Axis Bank Credit Card (..5678)';
  const ACC_ICICI_SAVINGS = 'ICICI Bank (..9012)';

  months.forEach((m, monthIndex) => {
    // 1. Monthly Salary (Inflow)
    balance += 95000;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-01`,
      account: ACC_HDFC_SALARY,
      bank: 'HDFC Bank',
      rawDescriptor: 'SALARY CREDIT // INFOSYS TECH LTD',
      amount: 95000,
      type: 'CREDIT',
      category: 'Income / Salary',
      balanceAfter: balance,
      isRecurringMandate: false,
    });

    // 2. TRAP 1: Netflix Silent Price Creep
    // Jan - Jul: ₹499/mo, Aug - Dec: ₹649/mo (Silent ₹150 hike!)
    const netflixAmt = monthIndex >= 7 ? 649 : 499;
    balance -= netflixAmt;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-05`,
      account: ACC_HDFC_SALARY,
      bank: 'HDFC Bank',
      rawDescriptor: 'BILLDESK*NFLX_MUM_AUTOPAY',
      amount: netflixAmt,
      type: 'DEBIT',
      category: 'Entertainment',
      balanceAfter: balance,
      isRecurringMandate: true,
      notes: monthIndex >= 7 ? 'Silent price hike +₹150 (+30%)' : undefined,
    });

    // 3. TRAP 2: Canva Pro Free Trial Trap
    // March 3: ₹2 verification auth
    // April 2 onwards: ₹899/mo full conversion
    if (monthIndex === 2) {
      balance -= 2;
      records.push({
        id: `stmt_${counter++}`,
        date: `${m.year}-${m.month}-03`,
        account: ACC_AXIS_CARD,
        bank: 'Axis Bank',
        rawDescriptor: 'CANVA*TRIAL*AUTH*BLR',
        amount: 2,
        type: 'DEBIT',
        category: 'Software',
        balanceAfter: balance,
        isRecurringMandate: true,
        notes: 'Token authorization for 30-day free trial',
      });
    } else if (monthIndex >= 3) {
      balance -= 899;
      records.push({
        id: `stmt_${counter++}`,
        date: `${m.year}-${m.month}-02`,
        account: ACC_AXIS_CARD,
        bank: 'Axis Bank',
        rawDescriptor: 'ACH*CANVA*SUB*BLR',
        amount: 899,
        type: 'DEBIT',
        category: 'Software',
        balanceAfter: balance,
        isRecurringMandate: true,
        notes: 'Trial auto-converted to full recurring plan',
      });
    }

    // 4. TRAP 3: Disney+ Hotstar Double Subscription (Cross-Account!)
    // Account 1 (HDFC Card): ₹299/mo
    balance -= 299;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-10`,
      account: ACC_HDFC_SALARY,
      bank: 'HDFC Bank',
      rawDescriptor: 'SI-HDFC-HOTSTAR-MUM',
      amount: 299,
      type: 'DEBIT',
      category: 'Entertainment',
      balanceAfter: balance,
      isRecurringMandate: true,
      notes: 'Card Standing Instruction',
    });

    // Account 2 (ICICI via Google Play UPI): ₹299/mo
    balance -= 299;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-14`,
      account: ACC_ICICI_SAVINGS,
      bank: 'ICICI Bank',
      rawDescriptor: 'GOOGLE*DISNEYHOTSTAR',
      amount: 299,
      type: 'DEBIT',
      category: 'Entertainment',
      balanceAfter: balance,
      isRecurringMandate: true,
      notes: 'Google Play UPI Autopay (Duplicate sub!)',
    });

    // 5. TRAP 4: Cult.fit Zombie Mandate (Dormant gym membership)
    // Bills ₹1,750/mo on e-NACH every month, 0 usage for 7 months
    balance -= 1750;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-18`,
      account: ACC_HDFC_SALARY,
      bank: 'HDFC Bank',
      rawDescriptor: 'NACH-DR-CULTFIT-BLR-09',
      amount: 1750,
      type: 'DEBIT',
      category: 'Fitness',
      balanceAfter: balance,
      isRecurringMandate: true,
      notes: monthIndex >= 5 ? 'Zombie mandate - no app usage for 7+ months' : undefined,
    });

    // 6. Regular Mandate 1: Spotify Premium (₹119/mo)
    balance -= 119;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-21`,
      account: ACC_ICICI_SAVINGS,
      bank: 'ICICI Bank',
      rawDescriptor: 'BILLDESK*SPOTIFY*IN',
      amount: 119,
      type: 'DEBIT',
      category: 'Music',
      balanceAfter: balance,
      isRecurringMandate: true,
    });

    // 7. Regular Mandate 2: Jio Fiber (₹1,179/mo)
    balance -= 1179;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-24`,
      account: ACC_HDFC_SALARY,
      bank: 'HDFC Bank',
      rawDescriptor: 'JIO*FIBER*AUTOPAY',
      amount: 1179,
      type: 'DEBIT',
      category: 'Utilities',
      balanceAfter: balance,
      isRecurringMandate: true,
    });

    // 8. Irregular Cadence / Usage: AWS Cloud Services (Varying ₹310 - ₹780)
    const awsAmounts = [310, 395, 420, 380, 510, 480, 620, 590, 710, 680, 740, 780];
    const awsAmt = awsAmounts[monthIndex];
    balance -= awsAmt;
    records.push({
      id: `stmt_${counter++}`,
      date: `${m.year}-${m.month}-27`,
      account: ACC_AXIS_CARD,
      bank: 'Axis Bank',
      rawDescriptor: 'AMZN WEB SERVICES MUM',
      amount: awsAmt,
      type: 'DEBIT',
      category: 'Cloud Services',
      balanceAfter: balance,
      isRecurringMandate: true,
      notes: 'Usage-based cloud billing',
    });

    // 9. Everyday Non-Recurring Transactions (Food, Cabs, Groceries)
    const dailyExpenses = [
      { day: '06', desc: 'SWIGGY*BANGALORE', amt: 340, cat: 'Food' },
      { day: '12', desc: 'UBER*TRIP*INDIA', amt: 260, cat: 'Travel' },
      { day: '16', desc: 'BLINKIT*INSTANT*BLR', amt: 480, cat: 'Groceries' },
      { day: '22', desc: 'CHAI POINT INDIRANAGAR', amt: 90, cat: 'Food' },
    ];

    dailyExpenses.forEach((exp) => {
      balance -= exp.amt;
      records.push({
        id: `stmt_${counter++}`,
        date: `${m.year}-${m.month}-${exp.day}`,
        account: ACC_HDFC_SALARY,
        bank: 'HDFC Bank',
        rawDescriptor: exp.desc,
        amount: exp.amt,
        type: 'DEBIT',
        category: exp.cat,
        balanceAfter: balance,
        isRecurringMandate: false,
      });
    });
  });

  return records;
}
