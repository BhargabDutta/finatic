# 🛡️ FINATIC // MASTER ARCHITECTURAL & PITCH GUIDE
### *Zero-Knowledge Mandate Intelligence, Real vs. Synthetic Data, and the Neo4j Graph Runbook*

---

## ⚡ 1. The Core Purpose: Why Auto-Debit Assassin Exists

| Question | The Honest Engineering Truth |
| :--- | :--- |
| **Why not just read SMS?** | Raw SMS is just noisy text: *"HDFC: Rs 649 debited for BILLDESK\*NFLX"*. It doesn't calculate your annual financial bleed, doesn't warn you when prices silently creep up, and doesn't tell you how to cancel when the merchant hides the cancel button. |
| **Can any app auto-cancel bank mandates?** | **NO.** Under RBI and NPCI regulations, revoking any bank mandate, UPI AutoPay, or Card SI requires **mandatory 2FA authentication** (UPI MPIN or Netbanking OTP). Any 3rd-party app claiming it can cancel bank auto-debits without your direct authorization is illegal malware. |
| **Why call it the "Assassin"?** | Subscriptions are designed as **Roach Motels** (easy to enter, impossible to leave). The Assassin extracts your **UMRN (Unique Mandate Reference Number)** from the SMS and directs you to revoke the mandate at the **bank / NPCI switch level** (e.g. inside GPay, PhonePe, or Bank SIHub). Once killed at the bank, the merchant cannot charge you ever again. |
| **What if a merchant still charges?** | Finatic generates a pre-formatted legal dispute notice citing **Section 25 of the Payment and Settlement Systems Act (PSSA)** to submit to the Bank Ombudsman. |

---

## 🔒 2. Privacy Architecture: Synthetic vs. Real Data

```
                      ┌──────────────────────────────────────────────┐
                      │            USER'S MOBILE DEVICE              │
                      │                                              │
  [Bank SMS Inbox] ──►│ 1. Telephony Ingress Filter (RAM)            │
                      │    ├── Drops OTPs, P2P & Retail in memory    │
                      │    └── Retains ONLY verified Auto-Payments   │
                      │                                              │
                      │ 2. Local Regex Tokenizer                     │
                      │    └── Extracts Amount, Merchant, UMRN, Rail │
                      │                                              │
                      │ 3. Encrypted Local Storage (AsyncStorage)    │
                      │    └── 100% on-device. Zero cloud leakage.  │
                      └──────────────────────┬───────────────────────┘
                                             │
                                             │ Zero-Knowledge Entity Lookup
                                             │ (Only Descriptor String, NO PII)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             NEO4J CLOUD GRAPH                │
                      │  (Public Merchant & Cancellation Intelligence│
                      │                                              │
                      │  (RawDescriptor) ──[:RESOLVES_TO]──►(Merchant│
                      │                                        │     │
                      │                                        ▼     │
                      │                             [:CANCELLED_VIA] │
                      │                                        ▼     │
                      │                               (Cancellation) │
                      └──────────────────────────────────────────────┘
```

### What is the Synthetic Data?
- **Definition**: A deterministic, realistic test suite containing authentic Indian banking descriptors, mandate structures, and edge-cases.
- **Why it exists**:
  1. **Privacy Shield**: When presenting on a projector or demoing to judges, you must never display a real user's private bank accounts or balance.
  2. **Edge-Case Demonstration**: A single real phone inbox rarely has all the trickiest subscription traps at once. The synthetic dataset reproduces:
     - **Stealth Price Creep**: Netflix increasing from ₹499 to ₹649 across consecutive billing cycles.
     - **Free Trial Ambush**: Canva starting with a ₹2 auth and converting to ₹899/month.
     - **Duplicate Subscriptions**: Paying for Spotify on an HDFC card AND on an Axis card simultaneously.
     - **Multiple Rails**: UPI AutoPay, Card SI (SIHub), and NACH e-mandates.

### How is Real Data Used?
1. **Local Telephony Scan**: In `finatic.apk`, the native scanner reads incoming SMS directly from the phone.
2. **Instant Memory Ingress Drop**: Banking OTPs, personal friend transfers (P2P), Swiggy/Zomato debits, and spam are **discarded in RAM**. They are never saved.
3. **Local Encryption**: Verified auto-payment mandates are stored strictly in local device storage (`@finatic_autopay_mandates_v2`).
4. **Zero-Knowledge Matching**: The app matches raw descriptors (`BILLDESK*NFLX`) against a dictionary or Neo4j alias graph. No private customer information (name, account number, or balance) is ever transmitted.

---

## 🕸️ 3. What to Show in Neo4j During Your Demo

When presenting to judges or your senior, open **Neo4j Browser** or **Neo4j Bloom** on your laptop and run this master Cypher script:

### Step 1: The Master Seed Script
```cypher
// 1. Clear previous graph
MATCH (n) DETACH DELETE n;

// 2. Create User and Accounts
CREATE (u:User {name: "Demonstration User", annualBleed: 58400})
CREATE (acc1:Account {bank: "HDFC Bank", type: "SALARY", last4: "1234"})
CREATE (acc2:Account {bank: "Axis Bank", type: "CREDIT_CARD", last4: "5678"})
CREATE (acc3:Account {bank: "ICICI Bank", type: "SAVINGS", last4: "9012"})

CREATE (u)-[:OWNS]->(acc1)
CREATE (u)-[:OWNS]->(acc2)
CREATE (u)-[:OWNS]->(acc3)

// 3. Entity Resolution Cluster (Messy Descriptors -> Canonical Brand)
CREATE (m_nflx:Merchant {name: "Netflix", category: "Entertainment"})
CREATE (d1:RawDescriptor {raw: "BILLDESK*MUM*NFLX"})
CREATE (d2:RawDescriptor {raw: "NFLX_IN_RECURRING"})
CREATE (d3:RawDescriptor {raw: "PAYU*NETFLIX_DIGITAL"})
CREATE (d1)-[:RESOLVES_TO]->(m_nflx)
CREATE (d2)-[:RESOLVES_TO]->(m_nflx)
CREATE (d3)-[:RESOLVES_TO]->(m_nflx)

// 4. Chained Time-Series (The Stealth Price Creep: ₹499 -> ₹649)
CREATE (mandate_nflx:Mandate {id: "MAN_001", rail: "UPI_AUTOPAY", threat: "PRICE_HIKE", umrn: "UMRN99482187"})
CREATE (acc1)-[:HAS_MANDATE]->(mandate_nflx)
CREATE (mandate_nflx)-[:CHARGED_BY]->(m_nflx)

CREATE (t1:DebitEvent {amount: 499, date: "2026-08-15", month: "August"})
CREATE (t2:DebitEvent {amount: 649, date: "2026-09-15", month: "September"})
CREATE (mandate_nflx)-[:HAS_CYCLE]->(t1)
CREATE (t1)-[:NEXT_DEBIT {hike: 150, alert: "STEALTH_PRICE_HIKE"}]->(t2)

// 5. Free Trial Trap (Canva: ₹2 -> ₹899)
CREATE (m_canva:Merchant {name: "Canva Pro", category: "Productivity"})
CREATE (mandate_canva:Mandate {id: "MAN_002", rail: "CARD_SI", threat: "TRIAL_CONVERSION"})
CREATE (acc2)-[:HAS_MANDATE]->(mandate_canva)
CREATE (mandate_canva)-[:CHARGED_BY]->(m_canva)

CREATE (trial1:DebitEvent {amount: 2, date: "2026-09-01", note: "Card Auth"})
CREATE (trial2:DebitEvent {amount: 899, date: "2026-10-01", note: "Auto-Billed Full"})
CREATE (mandate_canva)-[:HAS_CYCLE]->(trial1)
CREATE (trial1)-[:CONVERTED_TO {jump: 897, alert: "TRIAL_EXPIRED"}]->(trial2)

// 6. Killswitch Decision Tree
CREATE (kill:CancellationPath {rail: "UPI_AUTOPAY", primaryStep: "NPCI Switch Revocation"})
CREATE (step1:ActionStep {step: 1, action: "Open Google Pay or PhonePe -> Profile -> Autopay"})
CREATE (step2:ActionStep {step: 2, action: "Locate UMRN99482187 -> Tap 'Revoke Mandate'"})
CREATE (step3:ActionStep {step: 3, action: "If merchant persists: File RBI PSSA Section 25 Dispute"})
CREATE (mandate_nflx)-[:CANCELLED_VIA]->(kill)
CREATE (kill)-[:STEP_1]->(step1)
CREATE (step1)-[:STEP_2]->(step2)
CREATE (step2)-[:STEP_3]->(step3);
```

---

### Step 2: The 3 "Showstopper" Cypher Queries to Run for Judges

#### Query 1: Detect Silent Price Creeps (The Smoking Gun)
```cypher
MATCH (m:Merchant)<-[:CHARGED_BY]-(man:Mandate)-[:HAS_CYCLE]->(t1:DebitEvent)-[h:NEXT_DEBIT]->(t2:DebitEvent)
WHERE t2.amount > t1.amount
RETURN m.name AS Service,
       t1.amount AS Old_Price,
       t2.amount AS New_Price,
       (t2.amount - t1.amount) AS Stealth_Hike,
       h.alert AS Alert_Type;
```
> **What to say to judges:**  
> *"In SQL, comparing month-over-month transactions requires expensive self-joins across millions of rows. In Neo4j, payments are linked like chain links: `(t1)-[:NEXT_DEBIT]->(t2)`. This single 3-line query spots stealth price hikes across thousands of users in milliseconds."*

---

#### Query 2: Catch Free Trial Ambush Traps
```cypher
MATCH (m:Merchant)<-[:CHARGED_BY]-(man:Mandate)-[:HAS_CYCLE]->(t1:DebitEvent)-[r:CONVERTED_TO]->(t2:DebitEvent)
WHERE t1.amount <= 5 AND t2.amount > 100
RETURN m.name AS Service,
       t1.amount AS Trial_Auth_Fee,
       t2.amount AS Full_Subscription_Charge,
       man.rail AS Payment_Rail;
```
> **What to say to judges:**  
> *"Companies hook users with ₹2 card validations, then quietly convert to ₹899/month when the user forgets. Neo4j flags the jump automatically."*

---

#### Query 3: Multi-Account Duplicate Subscription Detection
```cypher
MATCH (u:User)-[:OWNS]->(acc:Account)-[:HAS_MANDATE]->(man:Mandate)-[:CHARGED_BY]->(m:Merchant)
WITH m, count(DISTINCT acc) AS accountCount, collect(acc.bank) AS banks, sum(man.monthlyAmount) AS totalBleed
WHERE accountCount > 1
RETURN m.name AS Redundant_Service,
       accountCount AS Accounts_Paying,
       banks AS Paying_Banks,
       totalBleed AS Monthly_Waste;
```
> **What to say to judges:**  
> *"In traditional apps, your HDFC bank and your Axis credit card never talk to each other. In Finatic's graph, all accounts connect to the user. If you are paying for Spotify on two different cards, Finatic immediately highlights the duplicate bleed."*

---

## 🎙️ The 30-Second Elevator Pitch
> *"Every month, Indians lose crores to cryptic bank descriptors, forgotten free trials, and stealth price hikes. Subscriptions are easy to enter, but intentionally made almost impossible to leave.  
> Finatic is the **Zero-Knowledge Auto-Debit Assassin**.  
> On your phone, it parses bank SMS with 100% privacy to calculate your true Annual Bleed.  
> In Neo4j, it connects messy merchant aliases, detects stealth price creeps along chained time-series, and provides the **1-Click Killswitch Runbook** to revoke NPCI bank mandates at the root level."*
