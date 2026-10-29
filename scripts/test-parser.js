const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('./src/services/smsParser.ts', 'utf8');
const transpiled = ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const moduleObj = { exports: {} };
const fn = new Function('module', 'exports', transpiled);
fn(moduleObj, moduleObj.exports);
const { isAutoPaymentSMS, parseSMS } = moduleObj.exports;

const testCases = [
  // 1. Should ACCEPT AutoPay / Mandates:
  {
    name: 'Netflix UPI AutoPay',
    sms: 'HDFC Bank: Rs. 649.00 debited from A/c **1234 towards UPI AutoPay mandate for NETFLIX ENTERTAINMENT. UMRN: UMRN99482187.',
    shouldAccept: true,
    expectedType: 'UPI_AUTOPAY',
    expectedAmount: 649,
    expectedMerchant: 'Netflix',
  },
  {
    name: 'Canva Pro Standing Instruction',
    sms: 'Axis Bank: Standing Instruction of Rs. 899.00 executed on Credit Card ending 5678 for CANVA PRO. Next auto-debit on 17-Nov-26.',
    shouldAccept: true,
    expectedType: 'CARD_SI',
    expectedAmount: 899,
    expectedMerchant: 'Canva Pro',
  },
  {
    name: 'Cult.fit NACH e-Mandate',
    sms: 'ICICI Bank: Auto-debit of Rs 1,750.00 processed via NACH mandate UMRN11928374 towards CULT FIT HEALTHCARE. Avail Bal: Rs 42,100.',
    shouldAccept: true,
    expectedType: 'NACH_ECS',
    expectedAmount: 1750,
    expectedMerchant: 'Cult.fit',
  },
  {
    name: 'Hotstar Pre-Debit Notification',
    sms: 'Pre-debit Notification: Rs. 299.00 will be auto-debited on 18-Oct-26 for recurring mandate SI-HDFC-HOTSTAR on Card **1234 for Disney+ Hotstar.',
    shouldAccept: true,
    expectedType: 'PRE_DEBIT_ALERT',
    expectedAmount: 299,
    expectedMerchant: 'Disney+ Hotstar',
  },

  // 2. Should HARD REJECT OTPs, Personal Transfers, Everyday Swipes:
  {
    name: 'Banking OTP Code (Must Reject)',
    sms: '392019 is your secret OTP for transaction of INR 3,250.00 at ZARA on HDFC Card XX4029. Valid for 5 mins. Do not share with anyone.',
    shouldAccept: false,
  },
  {
    name: 'Swiggy Food Debit (Must Reject)',
    sms: 'HDFC Bank: Rs. 1,420.00 debited from A/c **4029 on 17-OCT-26 to VPA swiggy@icici (UPI Ref 429103940192). Avail Bal: Rs 48,200.50.',
    shouldAccept: false,
  },
  {
    name: 'Friend P2P Transfer (Must Reject)',
    sms: 'Paid Rs 500 to Rahul Sharma using UPI on Google Pay. Ref: 412918491823.',
    shouldAccept: false,
  },
  {
    name: 'Promotional Loan Spam (Must Reject)',
    sms: 'Congratulations! Pre-approved Personal Loan of Rs. 5,00,000/- waiting for you with zero processing fee! Click to disburse instantly.',
    shouldAccept: false,
  },
];

console.log('--- RUNNING AUTOPAY PRIVACY SHIELD TESTS ---');
let passed = 0;

for (const t of testCases) {
  const isAuto = isAutoPaymentSMS(t.sms);
  if (isAuto !== t.shouldAccept) {
    console.error(`❌ FAILED: ${t.name} -> Expected isAutoPayment=${t.shouldAccept}, got ${isAuto}`);
  } else {
    if (t.shouldAccept) {
      const parsed = parseSMS(t.sms);
      if (parsed.type !== t.expectedType || parsed.amount !== t.expectedAmount || parsed.merchant !== t.expectedMerchant) {
        console.error(`❌ FAILED PARSE: ${t.name}`, parsed);
      } else {
        console.log(`✅ PASSED: ${t.name} -> Type: ${parsed.type}, Amount: ${parsed.amount}, Merchant: ${parsed.merchant}`);
        passed++;
      }
    } else {
      console.log(`✅ PASSED (SAFELY REJECTED): ${t.name}`);
      passed++;
    }
  }
}

console.log(`\nRESULTS: ${passed}/${testCases.length} Tests Passed!`);
if (passed === testCases.length) {
  console.log('🔒 ZERO-KNOWLEDGE PRIVACY SHIELD VERIFIED!');
}
