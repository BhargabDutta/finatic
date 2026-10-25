const fs = require('fs');
const path = require('path');

// Simulate the generation of synthetic data and cypher seed script
function buildCypherSeed() {
  const records = [
    {
      merchant: 'Netflix',
      category: 'Entertainment / OTT',
      raw: 'BILLDESK*NFLX_MUM_AUTOPAY',
      rail: 'UPI_AUTOPAY',
      account: 'HDFC Bank (..1234)',
      umrn: 'UMRN99482187',
      monthly: 649,
      annual: 7788,
      threat: 'PRICE_CREEP',
      history: [
        { date: '2026-06-05', amt: 499 },
        { date: '2026-07-05', amt: 499 },
        { date: '2026-08-05', amt: 649 },
        { date: '2026-09-05', amt: 649 },
      ]
    },
    {
      merchant: 'Canva Pro',
      category: 'Productivity & Design',
      raw: 'ACH*CANVA*SUB*BLR',
      rail: 'CARD_SI',
      account: 'Axis Bank Credit Card (..5678)',
      umrn: 'UMRN33829104',
      monthly: 899,
      annual: 10788,
      threat: 'TRIAL_TRAP',
      history: [
        { date: '2026-03-03', amt: 2 },
        { date: '2026-04-02', amt: 899 },
        { date: '2026-05-02', amt: 899 },
      ]
    },
    {
      merchant: 'Disney+ Hotstar (Card)',
      cleanMerchant: 'Disney+ Hotstar',
      category: 'Entertainment / OTT',
      raw: 'SI-HDFC-HOTSTAR-MUM',
      rail: 'CARD_SI',
      account: 'HDFC Bank (..1234)',
      umrn: 'UMRN44910283',
      monthly: 299,
      annual: 3588,
      threat: 'DOUBLE_SUBSCRIPTION',
      history: [
        { date: '2026-07-10', amt: 299 },
        { date: '2026-08-10', amt: 299 },
      ]
    },
    {
      merchant: 'Disney+ Hotstar (Google Play)',
      cleanMerchant: 'Disney+ Hotstar',
      category: 'Entertainment / OTT',
      raw: 'GOOGLE*DISNEYHOTSTAR',
      rail: 'APP_STORE',
      account: 'ICICI Bank (..9012)',
      umrn: 'UMRN55829104',
      monthly: 299,
      annual: 3588,
      threat: 'DOUBLE_SUBSCRIPTION',
      history: [
        { date: '2026-07-14', amt: 299 },
        { date: '2026-08-14', amt: 299 },
      ]
    },
    {
      merchant: 'Cult.fit Fitness',
      category: 'Health & Fitness',
      raw: 'NACH-DR-CULTFIT-BLR-09',
      rail: 'NACH',
      account: 'HDFC Bank (..1234)',
      umrn: 'UMRN11928374',
      monthly: 1750,
      annual: 21000,
      threat: 'ZOMBIE_CHARGE',
      history: [
        { date: '2026-06-18', amt: 1750 },
        { date: '2026-07-18', amt: 1750 },
        { date: '2026-08-18', amt: 1750 },
      ]
    },
    {
      merchant: 'Spotify Premium',
      category: 'Audio Streaming',
      raw: 'BILLDESK*SPOTIFY*IN',
      rail: 'UPI_AUTOPAY',
      account: 'ICICI Bank (..9012)',
      umrn: 'UMRN66718293',
      monthly: 119,
      annual: 1428,
      threat: 'NONE',
      history: [
        { date: '2026-07-21', amt: 119 },
        { date: '2026-08-21', amt: 119 },
      ]
    },
    {
      merchant: 'Jio Fiber Broadband',
      category: 'Utilities / Internet',
      raw: 'JIO*FIBER*AUTOPAY',
      rail: 'UPI_AUTOPAY',
      account: 'HDFC Bank (..1234)',
      umrn: 'UMRN88920194',
      monthly: 1179,
      annual: 14148,
      threat: 'NONE',
      history: [
        { date: '2026-07-24', amt: 1179 },
        { date: '2026-08-24', amt: 1179 },
      ]
    }
  ];

  let cypher = `// ============================================================
// FINATIC // MANDATE KNOWLEDGE GRAPH SEED SCRIPT
// Run this directly in Neo4j Browser or Cypher Shell
// ============================================================

// 1. Clear existing mandate test nodes
MATCH (n) DETACH DELETE n;

// 2. Create User Node
CREATE (u:User {id: "usr_finatic_01", name: "Bhargab Dutta", annualBleed: 62328});

// 3. Create Bank Accounts
CREATE (acc1:Account {id: "acc_hdfc", bank: "HDFC Bank", last4: "1234", type: "SALARY_ACCOUNT"});
CREATE (acc2:Account {id: "acc_axis", bank: "Axis Bank", last4: "5678", type: "CREDIT_CARD"});
CREATE (acc3:Account {id: "acc_icici", bank: "ICICI Bank", last4: "9012", type: "SAVINGS_ACCOUNT"});

CREATE (u)-[:OWNS]->(acc1);
CREATE (u)-[:OWNS]->(acc2);
CREATE (u)-[:OWNS]->(acc3);
\n`;

  records.forEach((r, idx) => {
    const accVar = r.account.includes('HDFC') ? 'acc1' : (r.account.includes('Axis') ? 'acc2' : 'acc3');
    const cleanName = r.cleanMerchant || r.merchant;
    const merchVar = `merch_${idx}`;
    const mandateVar = `mandate_${idx}`;
    const descVar = `desc_${idx}`;
    const cancelVar = `cancel_${idx}`;

    cypher += `// --- Mandate: ${r.merchant} ---
MERGE (${merchVar}:Merchant {name: "${cleanName}"})
ON CREATE SET ${merchVar}.category = "${r.category}";

CREATE (${descVar}:RawDescriptor {raw: "${r.raw}"});
CREATE (${descVar})-[:RESOLVES_TO]->(${merchVar});

CREATE (${mandateVar}:Mandate {
  id: "mandate_${idx}",
  rail: "${r.rail}",
  umrn: "${r.umrn}",
  monthlyAmount: ${r.monthly},
  annualAmount: ${r.annual},
  threatType: "${r.threat}",
  status: "${r.threat === 'NONE' ? 'ACTIVE' : 'FLAGGED'}"
});

CREATE (${accVar})-[:HAS_MANDATE]->(${mandateVar});
CREATE (${mandateVar})-[:CHARGED_BY]->(${merchVar});

CREATE (${cancelVar}:CancellationPath {rail: "${r.rail}"});
CREATE (${mandateVar})-[:CANCELLED_VIA]->(${cancelVar});
\n`;

    let prevVar = '';
    r.history.forEach((h, hIdx) => {
      const hVar = `ev_${idx}_${hIdx}`;
      cypher += `CREATE (${hVar}:DebitEvent {amount: ${h.amt}, date: "${h.date}"});
CREATE (${mandateVar})-[:BILLED]->(${hVar});
`;
      if (prevVar) {
        cypher += `CREATE (${prevVar})-[:NEXT_CHARGE]->(${hVar});\n`;
      }
      prevVar = hVar;
    });
    cypher += '\n';
  });

  cypher += `// ============================================================
// 4. VERIFICATION QUERIES (RUN IN NEO4J BROWSER)
// ============================================================

// Query 1: Detect Silent Price Increases
MATCH (m:Mandate)-[:BILLED]->(t1:DebitEvent)-[:NEXT_CHARGE]->(t2:DebitEvent)
MATCH (m)-[:CHARGED_BY]->(merch:Merchant)
WHERE t2.amount > t1.amount
RETURN merch.name AS Service, t1.amount AS OldPrice, t2.amount AS NewPrice, (t2.amount - t1.amount) AS StealthHike;

// Query 2: Detect Free Trial Traps (Auth <= 2 followed by full plan >= 150)
MATCH (m:Mandate)-[:BILLED]->(t0:DebitEvent)-[:NEXT_CHARGE]->(t1:DebitEvent)
MATCH (m)-[:CHARGED_BY]->(merch:Merchant)
WHERE t0.amount <= 2.0 AND t1.amount >= 150.0
RETURN merch.name AS Service, t0.amount AS AuthFee, t1.amount AS FullCharge, "TRIAL_AMBUSH" AS Threat;

// Query 3: Detect Double Subscriptions across accounts
MATCH (u:User)-[:OWNS]->(a:Account)-[:HAS_MANDATE]->(m:Mandate)-[:CHARGED_BY]->(merch:Merchant)
WITH merch, count(m) AS MandatesCount, collect(a.bank + ' (..' + a.last4 + ')') AS Accounts
WHERE MandatesCount > 1
RETURN merch.name AS DuplicateService, MandatesCount, Accounts;

// Query 4: Total Annual Bleed
MATCH (u:User)-[:OWNS]->(:Account)-[:HAS_MANDATE]->(m:Mandate)
RETURN count(m) AS TotalMandates, sum(m.monthlyAmount) AS MonthlyBleed, sum(m.annualAmount) AS AnnualBleedTotal;
`;

  return cypher;
}

const cypherOutput = buildCypherSeed();
const outputPath = path.join(__dirname, 'seed-neo4j.cypher');
fs.writeFileSync(outputPath, cypherOutput, 'utf8');
console.log('Neo4j Cypher script written to: ' + outputPath);
