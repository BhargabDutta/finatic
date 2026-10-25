// ============================================================
// FINATIC // COMPLETE CONNECTED MANDATE GRAPH (SINGLE STATEMENT)
// Copy-paste this entire block into Neo4j Workspace / Browser
// ============================================================

MATCH (n) DETACH DELETE n;

CREATE 
  // 1. User & Accounts
  (u:User {id: "usr_finatic_01", name: "Bhargab Dutta", annualBleed: 62328}),
  (acc1:Account {id: "acc_hdfc", bank: "HDFC Bank", last4: "1234", type: "SALARY_ACCOUNT"}),
  (acc2:Account {id: "acc_axis", bank: "Axis Bank", last4: "5678", type: "CREDIT_CARD"}),
  (acc3:Account {id: "acc_icici", bank: "ICICI Bank", last4: "9012", type: "SAVINGS_ACCOUNT"}),
  (u)-[:OWNS]->(acc1),
  (u)-[:OWNS]->(acc2),
  (u)-[:OWNS]->(acc3),

  // 2. Merchants
  (m_netflix:Merchant {name: "Netflix", category: "Entertainment / OTT"}),
  (m_canva:Merchant {name: "Canva Pro", category: "Productivity & Design"}),
  (m_hotstar:Merchant {name: "Disney+ Hotstar", category: "Entertainment / OTT"}),
  (m_cultfit:Merchant {name: "Cult.fit", category: "Health & Fitness"}),
  (m_spotify:Merchant {name: "Spotify Premium", category: "Audio Streaming"}),
  (m_jio:Merchant {name: "Jio Fiber", category: "Utilities / Internet"}),

  // 3. Raw Descriptors
  (d_nflx:RawDescriptor {raw: "BILLDESK*NFLX_MUM_AUTOPAY"}),
  (d_canva:RawDescriptor {raw: "ACH*CANVA*SUB*BLR"}),
  (d_hotstar1:RawDescriptor {raw: "SI-HDFC-HOTSTAR-MUM"}),
  (d_hotstar2:RawDescriptor {raw: "GOOGLE*DISNEYHOTSTAR"}),
  (d_cultfit:RawDescriptor {raw: "NACH-DR-CULTFIT-BLR-09"}),
  (d_spotify:RawDescriptor {raw: "BILLDESK*SPOTIFY*IN"}),
  (d_jio:RawDescriptor {raw: "JIO*FIBER*AUTOPAY"}),

  (d_nflx)-[:RESOLVES_TO]->(m_netflix),
  (d_canva)-[:RESOLVES_TO]->(m_canva),
  (d_hotstar1)-[:RESOLVES_TO]->(m_hotstar),
  (d_hotstar2)-[:RESOLVES_TO]->(m_hotstar),
  (d_cultfit)-[:RESOLVES_TO]->(m_cultfit),
  (d_spotify)-[:RESOLVES_TO]->(m_spotify),
  (d_jio)-[:RESOLVES_TO]->(m_jio),

  // 4. Mandates
  (man_nflx:Mandate {id: "man_nflx", rail: "UPI_AUTOPAY", umrn: "UMRN99482187", monthlyAmount: 649, annualAmount: 7788, threatType: "PRICE_CREEP", status: "FLAGGED"}),
  (man_canva:Mandate {id: "man_canva", rail: "CARD_SI", umrn: "UMRN33829104", monthlyAmount: 899, annualAmount: 10788, threatType: "TRIAL_TRAP", status: "FLAGGED"}),
  (man_hotstar1:Mandate {id: "man_hotstar1", rail: "CARD_SI", umrn: "UMRN44910283", monthlyAmount: 299, annualAmount: 3588, threatType: "DOUBLE_SUBSCRIPTION", status: "FLAGGED"}),
  (man_hotstar2:Mandate {id: "man_hotstar2", rail: "APP_STORE", umrn: "UMRN55829104", monthlyAmount: 299, annualAmount: 3588, threatType: "DOUBLE_SUBSCRIPTION", status: "FLAGGED"}),
  (man_cultfit:Mandate {id: "man_cultfit", rail: "NACH", umrn: "UMRN11928374", monthlyAmount: 1750, annualAmount: 21000, threatType: "ZOMBIE_CHARGE", status: "FLAGGED"}),
  (man_spotify:Mandate {id: "man_spotify", rail: "UPI_AUTOPAY", umrn: "UMRN66718293", monthlyAmount: 119, annualAmount: 1428, threatType: "NONE", status: "ACTIVE"}),
  (man_jio:Mandate {id: "man_jio", rail: "UPI_AUTOPAY", umrn: "UMRN88920194", monthlyAmount: 1179, annualAmount: 14148, threatType: "NONE", status: "ACTIVE"}),

  (acc1)-[:HAS_MANDATE]->(man_nflx),
  (acc2)-[:HAS_MANDATE]->(man_canva),
  (acc1)-[:HAS_MANDATE]->(man_hotstar1),
  (acc3)-[:HAS_MANDATE]->(man_hotstar2),
  (acc1)-[:HAS_MANDATE]->(man_cultfit),
  (acc3)-[:HAS_MANDATE]->(man_spotify),
  (acc1)-[:HAS_MANDATE]->(man_jio),

  (man_nflx)-[:CHARGED_BY]->(m_netflix),
  (man_canva)-[:CHARGED_BY]->(m_canva),
  (man_hotstar1)-[:CHARGED_BY]->(m_hotstar),
  (man_hotstar2)-[:CHARGED_BY]->(m_hotstar),
  (man_cultfit)-[:CHARGED_BY]->(m_cultfit),
  (man_spotify)-[:CHARGED_BY]->(m_spotify),
  (man_jio)-[:CHARGED_BY]->(m_jio),

  // 5. Cancellation Paths
  (c_upi:CancellationPath {rail: "UPI_AUTOPAY"}),
  (c_card:CancellationPath {rail: "CARD_SI"}),
  (c_nach:CancellationPath {rail: "NACH"}),
  (c_app:CancellationPath {rail: "APP_STORE"}),

  (man_nflx)-[:CANCELLED_VIA]->(c_upi),
  (man_canva)-[:CANCELLED_VIA]->(c_card),
  (man_hotstar1)-[:CANCELLED_VIA]->(c_card),
  (man_hotstar2)-[:CANCELLED_VIA]->(c_app),
  (man_cultfit)-[:CANCELLED_VIA]->(c_nach),
  (man_spotify)-[:CANCELLED_VIA]->(c_upi),
  (man_jio)-[:CANCELLED_VIA]->(c_upi),

  // 6. Chained Time-Series Events: Netflix (PRICE CREEP: 499 -> 499 -> 649 -> 649)
  (ev_n0:DebitEvent {amount: 499, date: "2026-06-05"}),
  (ev_n1:DebitEvent {amount: 499, date: "2026-07-05"}),
  (ev_n2:DebitEvent {amount: 649, date: "2026-08-05"}),
  (ev_n3:DebitEvent {amount: 649, date: "2026-09-05"}),

  (man_nflx)-[:BILLED]->(ev_n0),
  (man_nflx)-[:BILLED]->(ev_n1),
  (man_nflx)-[:BILLED]->(ev_n2),
  (man_nflx)-[:BILLED]->(ev_n3),

  (ev_n0)-[:NEXT_CHARGE]->(ev_n1),
  (ev_n1)-[:NEXT_CHARGE]->(ev_n2),
  (ev_n2)-[:NEXT_CHARGE]->(ev_n3),

  // 7. Chained Time-Series Events: Canva Pro (TRIAL TRAP: 2 -> 899 -> 899)
  (ev_c0:DebitEvent {amount: 2, date: "2026-03-03"}),
  (ev_c1:DebitEvent {amount: 899, date: "2026-04-02"}),
  (ev_c2:DebitEvent {amount: 899, date: "2026-05-02"}),

  (man_canva)-[:BILLED]->(ev_c0),
  (man_canva)-[:BILLED]->(ev_c1),
  (man_canva)-[:BILLED]->(ev_c2),

  (ev_c0)-[:NEXT_CHARGE]->(ev_c1),
  (ev_c1)-[:NEXT_CHARGE]->(ev_c2),

  // 8. Chained Time-Series Events: Cult.fit (ZOMBIE: 1750 every month)
  (ev_cf1:DebitEvent {amount: 1750, date: "2026-06-18"}),
  (ev_cf2:DebitEvent {amount: 1750, date: "2026-07-18"}),
  (ev_cf3:DebitEvent {amount: 1750, date: "2026-08-18"}),

  (man_cultfit)-[:BILLED]->(ev_cf1),
  (man_cultfit)-[:BILLED]->(ev_cf2),
  (man_cultfit)-[:BILLED]->(ev_cf3),

  (ev_cf1)-[:NEXT_CHARGE]->(ev_cf2),
  (ev_cf2)-[:NEXT_CHARGE]->(ev_cf3),

  // 9. Regular Events
  (ev_sp1:DebitEvent {amount: 119, date: "2026-08-21"}),
  (man_spotify)-[:BILLED]->(ev_sp1),

  (ev_jio1:DebitEvent {amount: 1179, date: "2026-08-24"}),
  (man_jio)-[:BILLED]->(ev_jio1);
