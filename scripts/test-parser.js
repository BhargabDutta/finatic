const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('./src/services/smsParser.ts', 'utf8');
const transpiled = ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const moduleObj = { exports: {} };
const fn = new Function('module', 'exports', transpiled);
fn(moduleObj, moduleObj.exports);
const { parseSMS } = moduleObj.exports;

const testCases = [
  {
    sms: 'HDFC Bank: Rs. 1,420.00 debited from A/c **4029 on 17-OCT-26 to VPA swiggy@icici (UPI Ref 429103940192). Avail Bal: Rs 48,200.50.',
    sender: 'VK-HDFCBK',
    expectedType: 'DEBIT',
    expectedAmount: 1420.0,
    expectedMerchant: 'Swiggy',
    expectedCategory: 'FOOD_DINING',
  },
  {
    sms: 'Chase: You made a $42.50 debit card transaction with STARBUCKS on Oct 17. Avail Bal: $1,280.40.',
    sender: 'CHASE',
    expectedType: 'DEBIT',
    expectedAmount: 42.5,
    expectedMerchant: 'Starbucks',
    expectedCategory: 'FOOD_DINING',
  },
  {
    sms: 'Dear Customer, INR 85,000.00 credited to your A/C XX4029 on 16-OCT-26 by SALARY/TECH GLOBAL CORP. Available Bal: INR 1,32,400.00.',
    sender: 'VK-HDFCBK',
    expectedType: 'CREDIT',
    expectedAmount: 85000.0,
    expectedCategory: 'SALARY_INCOME',
  },
  {
    sms: 'Your HDFC Bank Credit Card ending 4029 statement generated. Total Due: Rs 14,820.00. Min Due: Rs 1,200.00. Due Date: 28-OCT-26.',
    sender: 'VK-HDFCBK',
    expectedType: 'BILL_DUE',
    expectedAmount: 14820.0,
  },
  {
    sms: '392019 is your secret OTP for transaction of INR 3,250.00 at ZARA on HDFC Card XX4029. Valid for 5 mins. Do not share with anyone.',
    sender: 'VK-HDFCBK',
    expectedType: 'OTP_AUTH',
    expectedOtp: '392019',
  },
  {
    sms: 'Pre-approved Personal Loan of Rs. 5,00,000/- waiting for you with zero processing fee! Click to disburse instantly.',
    sender: 'VM-BAJAJ',
    expectedType: 'PROMOTIONAL',
  },
  {
    sms: 'Zerodha: SIP executed! Rs 5,000 invested in NIPPON INDIA GROWTH FUND on 14-OCT-26. Units allotted: 45.28 at NAV Rs 110.42.',
    sender: 'AX-ZERODHA',
    expectedType: 'INVESTMENT',
    expectedAmount: 5000.0,
  },
];

console.log('--- STARTING SMS PARSER VERIFICATION ---');
let passed = 0;

testCases.forEach((tc, idx) => {
  const result = parseSMS(tc.sms, tc.sender);
  console.log(`\nTest #${idx + 1}: ${tc.sms.substring(0, 50)}...`);
  console.log(`  Parsed: Type=${result.type}, Amount=${result.currencySymbol}${result.amount}, Merchant=${result.merchant}, Category=${result.category}, Bank=${result.bankOrSender}, OTP=${result.otpCode}, Conf=${result.confidenceScore}%`);

  let ok = true;
  if (tc.expectedType && result.type !== tc.expectedType) {
    console.error(`  FAIL: Type expected ${tc.expectedType}, got ${result.type}`);
    ok = false;
  }
  if (tc.expectedAmount !== undefined && result.amount !== tc.expectedAmount) {
    console.error(`  FAIL: Amount expected ${tc.expectedAmount}, got ${result.amount}`);
    ok = false;
  }
  if (tc.expectedMerchant && result.merchant !== tc.expectedMerchant) {
    console.error(`  FAIL: Merchant expected ${tc.expectedMerchant}, got ${result.merchant}`);
    ok = false;
  }
  if (tc.expectedCategory && result.category !== tc.expectedCategory) {
    console.error(`  FAIL: Category expected ${tc.expectedCategory}, got ${result.category}`);
    ok = false;
  }
  if (tc.expectedOtp && result.otpCode !== tc.expectedOtp) {
    console.error(`  FAIL: OTP expected ${tc.expectedOtp}, got ${result.otpCode}`);
    ok = false;
  }

  if (ok) {
    console.log('  PASS');
    passed++;
  }
});

console.log(`\n--- RESULT: ${passed} / ${testCases.length} TESTS PASSED ---`);
if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
