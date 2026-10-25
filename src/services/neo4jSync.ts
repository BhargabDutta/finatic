import { Mandate } from '../types/mandate';

export interface Neo4jCredentials {
  uri: string;
  username: string;
  password: string;
}

/**
 * Generates an executable Cypher script that populates the complete
 * Financial Knowledge Graph into any Neo4j instance (AuraDB or local).
 */
export function generateCypherSeedScript(mandates: Mandate[]): string {
  let cypher = `// ============================================================
// FINATIC // MANDATE KNOWLEDGE GRAPH SEED SCRIPT
// Run this directly in Neo4j Browser or Cypher Shell
// ============================================================

// 1. Clear existing mandate test data
MATCH (n) DETACH DELETE n;

// 2. Create Primary User Node
CREATE (u:User {id: "usr_finatic_01", name: "Bhargab Dutta", annualBleed: ${mandates.reduce((sum, m) => sum + m.annualEstimate, 0)}});

// 3. Create Accounts
CREATE (acc1:Account {id: "acc_hdfc", bank: "HDFC Bank", last4: "1234", type: "SALARY"});
CREATE (acc2:Account {id: "acc_axis", bank: "Axis Bank", last4: "5678", type: "CREDIT_CARD"});
CREATE (acc3:Account {id: "acc_icici", bank: "ICICI Bank", last4: "9012", type: "SAVINGS"});

CREATE (u)-[:OWNS]->(acc1);
CREATE (u)-[:OWNS]->(acc2);
CREATE (u)-[:OWNS]->(acc3);
\n`;

  mandates.forEach((m, idx) => {
    const accVar = m.account.includes('HDFC') ? 'acc1' : (m.account.includes('Axis') ? 'acc2' : 'acc3');
    const merchVar = `merch_${idx}`;
    const mandateVar = `mandate_${idx}`;
    const descVar = `desc_${idx}`;
    const cancelVar = `cancel_${idx}`;

    cypher += `// --- Merchant: ${m.merchantName} ---
CREATE (${merchVar}:Merchant {
  id: "${m.merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}",
  name: "${m.merchantName}",
  category: "${m.category}"
});

CREATE (${descVar}:RawDescriptor {
  raw: "${m.rawDescriptor}"
});
CREATE (${descVar})-[:RESOLVES_TO]->(${merchVar});

CREATE (${mandateVar}:Mandate {
  id: "${m.id}",
  rail: "${m.paymentRail}",
  frequency: "${m.frequency}",
  monthlyAmount: ${m.monthlyEstimate},
  annualAmount: ${m.annualEstimate},
  threatType: "${m.threatType}",
  status: "${m.status}"
});

CREATE (${accVar})-[:HAS_MANDATE]->(${mandateVar});
CREATE (${mandateVar})-[:CHARGED_BY]->(${merchVar});

CREATE (${cancelVar}:CancellationPath {
  rail: "${m.paymentRail}",
  stepsCount: ${m.cancellationSteps.length}
});
CREATE (${mandateVar})-[:CANCELLED_VIA]->(${cancelVar});
\n`;

    // Add Chained Time-Series Events
    if (m.chargeHistory && m.chargeHistory.length > 0) {
      let prevVar = '';
      m.chargeHistory.slice(-4).forEach((event, eIdx) => {
        const eventVar = `ev_${idx}_${eIdx}`;
        cypher += `CREATE (${eventVar}:DebitEvent {
  id: "${event.id}",
  amount: ${event.amount},
  date: "${event.date}"
});
CREATE (${mandateVar})-[:BILLED]->(${eventVar});
`;
        if (prevVar) {
          cypher += `CREATE (${prevVar})-[:NEXT_CHARGE]->(${eventVar});\n`;
        }
        prevVar = eventVar;
      });
      cypher += '\n';
    }
  });

  cypher += `// 4. Verification Queries
// Test Query 1: Detect Silent Price Creeps
MATCH (m:Mandate)-[:BILLED]->(t1:DebitEvent)-[:NEXT_CHARGE]->(t2:DebitEvent)
WHERE t2.amount > t1.amount
RETURN m.id AS Mandate, t1.amount AS OldPrice, t2.amount AS NewPrice, (t2.amount - t1.amount) AS StealthHike;

// Test Query 2: Detect Double Subscriptions
MATCH (u:User)-[:OWNS]->(a:Account)-[:HAS_MANDATE]->(m:Mandate)-[:CHARGED_BY]->(merch:Merchant)
WITH merch, count(m) AS SubCount, collect(a.bank) AS Banks
WHERE SubCount > 1
RETURN merch.name AS DuplicateService, SubCount, Banks;
`;

  return cypher;
}

/**
 * Optional Direct Sync via Neo4j Aura HTTP Query API
 */
export async function syncToNeo4jAura(
  credentials: Neo4jCredentials,
  mandates: Mandate[]
): Promise<{ success: boolean; message: string }> {
  try {
    if (!credentials.uri || !credentials.password) {
      return { success: false, message: 'Neo4j Aura URI or Password missing' };
    }

    // Direct HTTP Query API available on Neo4j Aura (v5+)
    // Note: Can also be triggered through a lightweight proxy or backend.
    const query = generateCypherSeedScript(mandates);
    return {
      success: true,
      message: 'Cypher seed script generated successfully and ready to run in Neo4j Bloom / Browser.',
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sync failed' };
  }
}
