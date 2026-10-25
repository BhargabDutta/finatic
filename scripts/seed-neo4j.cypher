// ============================================================
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

// --- Mandate: Netflix ---
MERGE (merch_0:Merchant {name: "Netflix"})
ON CREATE SET merch_0.category = "Entertainment / OTT";

CREATE (desc_0:RawDescriptor {raw: "BILLDESK*NFLX_MUM_AUTOPAY"});
CREATE (desc_0)-[:RESOLVES_TO]->(merch_0);

CREATE (mandate_0:Mandate {
  id: "mandate_0",
  rail: "UPI_AUTOPAY",
  umrn: "UMRN99482187",
  monthlyAmount: 649,
  annualAmount: 7788,
  threatType: "PRICE_CREEP",
  status: "FLAGGED"
});

CREATE (acc1)-[:HAS_MANDATE]->(mandate_0);
CREATE (mandate_0)-[:CHARGED_BY]->(merch_0);

CREATE (cancel_0:CancellationPath {rail: "UPI_AUTOPAY"});
CREATE (mandate_0)-[:CANCELLED_VIA]->(cancel_0);

CREATE (ev_0_0:DebitEvent {amount: 499, date: "2026-06-05"});
CREATE (mandate_0)-[:BILLED]->(ev_0_0);
CREATE (ev_0_1:DebitEvent {amount: 499, date: "2026-07-05"});
CREATE (mandate_0)-[:BILLED]->(ev_0_1);
CREATE (ev_0_0)-[:NEXT_CHARGE]->(ev_0_1);
CREATE (ev_0_2:DebitEvent {amount: 649, date: "2026-08-05"});
CREATE (mandate_0)-[:BILLED]->(ev_0_2);
CREATE (ev_0_1)-[:NEXT_CHARGE]->(ev_0_2);
CREATE (ev_0_3:DebitEvent {amount: 649, date: "2026-09-05"});
CREATE (mandate_0)-[:BILLED]->(ev_0_3);
CREATE (ev_0_2)-[:NEXT_CHARGE]->(ev_0_3);

// --- Mandate: Canva Pro ---
MERGE (merch_1:Merchant {name: "Canva Pro"})
ON CREATE SET merch_1.category = "Productivity & Design";

CREATE (desc_1:RawDescriptor {raw: "ACH*CANVA*SUB*BLR"});
CREATE (desc_1)-[:RESOLVES_TO]->(merch_1);

CREATE (mandate_1:Mandate {
  id: "mandate_1",
  rail: "CARD_SI",
  umrn: "UMRN33829104",
  monthlyAmount: 899,
  annualAmount: 10788,
  threatType: "TRIAL_TRAP",
  status: "FLAGGED"
});

CREATE (acc2)-[:HAS_MANDATE]->(mandate_1);
CREATE (mandate_1)-[:CHARGED_BY]->(merch_1);

CREATE (cancel_1:CancellationPath {rail: "CARD_SI"});
CREATE (mandate_1)-[:CANCELLED_VIA]->(cancel_1);

CREATE (ev_1_0:DebitEvent {amount: 2, date: "2026-03-03"});
CREATE (mandate_1)-[:BILLED]->(ev_1_0);
CREATE (ev_1_1:DebitEvent {amount: 899, date: "2026-04-02"});
CREATE (mandate_1)-[:BILLED]->(ev_1_1);
CREATE (ev_1_0)-[:NEXT_CHARGE]->(ev_1_1);
CREATE (ev_1_2:DebitEvent {amount: 899, date: "2026-05-02"});
CREATE (mandate_1)-[:BILLED]->(ev_1_2);
CREATE (ev_1_1)-[:NEXT_CHARGE]->(ev_1_2);

// --- Mandate: Disney+ Hotstar (Card) ---
MERGE (merch_2:Merchant {name: "Disney+ Hotstar"})
ON CREATE SET merch_2.category = "Entertainment / OTT";

CREATE (desc_2:RawDescriptor {raw: "SI-HDFC-HOTSTAR-MUM"});
CREATE (desc_2)-[:RESOLVES_TO]->(merch_2);

CREATE (mandate_2:Mandate {
  id: "mandate_2",
  rail: "CARD_SI",
  umrn: "UMRN44910283",
  monthlyAmount: 299,
  annualAmount: 3588,
  threatType: "DOUBLE_SUBSCRIPTION",
  status: "FLAGGED"
});

CREATE (acc1)-[:HAS_MANDATE]->(mandate_2);
CREATE (mandate_2)-[:CHARGED_BY]->(merch_2);

CREATE (cancel_2:CancellationPath {rail: "CARD_SI"});
CREATE (mandate_2)-[:CANCELLED_VIA]->(cancel_2);

CREATE (ev_2_0:DebitEvent {amount: 299, date: "2026-07-10"});
CREATE (mandate_2)-[:BILLED]->(ev_2_0);
CREATE (ev_2_1:DebitEvent {amount: 299, date: "2026-08-10"});
CREATE (mandate_2)-[:BILLED]->(ev_2_1);
CREATE (ev_2_0)-[:NEXT_CHARGE]->(ev_2_1);

// --- Mandate: Disney+ Hotstar (Google Play) ---
MERGE (merch_3:Merchant {name: "Disney+ Hotstar"})
ON CREATE SET merch_3.category = "Entertainment / OTT";

CREATE (desc_3:RawDescriptor {raw: "GOOGLE*DISNEYHOTSTAR"});
CREATE (desc_3)-[:RESOLVES_TO]->(merch_3);

CREATE (mandate_3:Mandate {
  id: "mandate_3",
  rail: "APP_STORE",
  umrn: "UMRN55829104",
  monthlyAmount: 299,
  annualAmount: 3588,
  threatType: "DOUBLE_SUBSCRIPTION",
  status: "FLAGGED"
});

CREATE (acc3)-[:HAS_MANDATE]->(mandate_3);
CREATE (mandate_3)-[:CHARGED_BY]->(merch_3);

CREATE (cancel_3:CancellationPath {rail: "APP_STORE"});
CREATE (mandate_3)-[:CANCELLED_VIA]->(cancel_3);

CREATE (ev_3_0:DebitEvent {amount: 299, date: "2026-07-14"});
CREATE (mandate_3)-[:BILLED]->(ev_3_0);
CREATE (ev_3_1:DebitEvent {amount: 299, date: "2026-08-14"});
CREATE (mandate_3)-[:BILLED]->(ev_3_1);
CREATE (ev_3_0)-[:NEXT_CHARGE]->(ev_3_1);

// --- Mandate: Cult.fit Fitness ---
MERGE (merch_4:Merchant {name: "Cult.fit Fitness"})
ON CREATE SET merch_4.category = "Health & Fitness";

CREATE (desc_4:RawDescriptor {raw: "NACH-DR-CULTFIT-BLR-09"});
CREATE (desc_4)-[:RESOLVES_TO]->(merch_4);

CREATE (mandate_4:Mandate {
  id: "mandate_4",
  rail: "NACH",
  umrn: "UMRN11928374",
  monthlyAmount: 1750,
  annualAmount: 21000,
  threatType: "ZOMBIE_CHARGE",
  status: "FLAGGED"
});

CREATE (acc1)-[:HAS_MANDATE]->(mandate_4);
CREATE (mandate_4)-[:CHARGED_BY]->(merch_4);

CREATE (cancel_4:CancellationPath {rail: "NACH"});
CREATE (mandate_4)-[:CANCELLED_VIA]->(cancel_4);

CREATE (ev_4_0:DebitEvent {amount: 1750, date: "2026-06-18"});
CREATE (mandate_4)-[:BILLED]->(ev_4_0);
CREATE (ev_4_1:DebitEvent {amount: 1750, date: "2026-07-18"});
CREATE (mandate_4)-[:BILLED]->(ev_4_1);
CREATE (ev_4_0)-[:NEXT_CHARGE]->(ev_4_1);
CREATE (ev_4_2:DebitEvent {amount: 1750, date: "2026-08-18"});
CREATE (mandate_4)-[:BILLED]->(ev_4_2);
CREATE (ev_4_1)-[:NEXT_CHARGE]->(ev_4_2);

// --- Mandate: Spotify Premium ---
MERGE (merch_5:Merchant {name: "Spotify Premium"})
ON CREATE SET merch_5.category = "Audio Streaming";

CREATE (desc_5:RawDescriptor {raw: "BILLDESK*SPOTIFY*IN"});
CREATE (desc_5)-[:RESOLVES_TO]->(merch_5);

CREATE (mandate_5:Mandate {
  id: "mandate_5",
  rail: "UPI_AUTOPAY",
  umrn: "UMRN66718293",
  monthlyAmount: 119,
  annualAmount: 1428,
  threatType: "NONE",
  status: "ACTIVE"
});

CREATE (acc3)-[:HAS_MANDATE]->(mandate_5);
CREATE (mandate_5)-[:CHARGED_BY]->(merch_5);

CREATE (cancel_5:CancellationPath {rail: "UPI_AUTOPAY"});
CREATE (mandate_5)-[:CANCELLED_VIA]->(cancel_5);

CREATE (ev_5_0:DebitEvent {amount: 119, date: "2026-07-21"});
CREATE (mandate_5)-[:BILLED]->(ev_5_0);
CREATE (ev_5_1:DebitEvent {amount: 119, date: "2026-08-21"});
CREATE (mandate_5)-[:BILLED]->(ev_5_1);
CREATE (ev_5_0)-[:NEXT_CHARGE]->(ev_5_1);

// --- Mandate: Jio Fiber Broadband ---
MERGE (merch_6:Merchant {name: "Jio Fiber Broadband"})
ON CREATE SET merch_6.category = "Utilities / Internet";

CREATE (desc_6:RawDescriptor {raw: "JIO*FIBER*AUTOPAY"});
CREATE (desc_6)-[:RESOLVES_TO]->(merch_6);

CREATE (mandate_6:Mandate {
  id: "mandate_6",
  rail: "UPI_AUTOPAY",
  umrn: "UMRN88920194",
  monthlyAmount: 1179,
  annualAmount: 14148,
  threatType: "NONE",
  status: "ACTIVE"
});

CREATE (acc1)-[:HAS_MANDATE]->(mandate_6);
CREATE (mandate_6)-[:CHARGED_BY]->(merch_6);

CREATE (cancel_6:CancellationPath {rail: "UPI_AUTOPAY"});
CREATE (mandate_6)-[:CANCELLED_VIA]->(cancel_6);

CREATE (ev_6_0:DebitEvent {amount: 1179, date: "2026-07-24"});
CREATE (mandate_6)-[:BILLED]->(ev_6_0);
CREATE (ev_6_1:DebitEvent {amount: 1179, date: "2026-08-24"});
CREATE (mandate_6)-[:BILLED]->(ev_6_1);
CREATE (ev_6_0)-[:NEXT_CHARGE]->(ev_6_1);

// ============================================================
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
