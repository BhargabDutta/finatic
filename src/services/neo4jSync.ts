import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mandate } from '../types/mandate';

export interface Neo4jCredentials {
  uri: string;
  username: string;
  password: string;
  database?: string;
}

export interface AuraThreatResult {
  stealthHikes: {
    service: string;
    oldPrice: number;
    newPrice: number;
    hike: number;
  }[];
  duplicateSubs: {
    service: string;
    subCount: number;
    accounts: string[];
  }[];
  nodeCount: number;
  relCount: number;
}

export interface AuraSyncResult {
  success: boolean;
  message: string;
  latencyMs: number;
  threats?: AuraThreatResult;
  rawResponse?: any;
}

const STORAGE_KEY_CREDS = '@finatic_neo4j_aura_creds';

/**
 * DEFAULT NEO4J AURA CONFIGURATION IN CODE
 * You can put your permanent Neo4j Aura URI and password here.
 * The app will automatically use these credentials out-of-the-box!
 */
export const DEFAULT_AURA_CREDENTIALS: Neo4jCredentials = {
  uri: '', // e.g. 'neo4j+s://xxxxxxxx.databases.neo4j.io'
  username: 'neo4j',
  password: '', // e.g. 'your-database-password'
  database: 'neo4j',
};

/**
 * Base64 helper compatible with all React Native and JS runtimes
 */
export function toBase64(input: string): string {
  try {
    if (typeof btoa === 'function') {
      return btoa(input);
    }
  } catch {}

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';

  for (
    let block = 0, charCode: number, idx = 0, map = chars;
    str.charAt(idx | 0) || ((map = '='), idx % 1);
    output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
  ) {
    charCode = str.charCodeAt((idx += 3 / 4));
    if (charCode > 0xff) {
      throw new Error('Invalid character in base64 conversion');
    }
    block = (block << 8) | charCode;
  }

  return output;
}

/**
 * Normalizes Neo4j Aura URIs into the transactional HTTP endpoint
 * e.g. "neo4j+s://abc.databases.neo4j.io" -> "https://abc.databases.neo4j.io/db/neo4j/tx/commit"
 */
export function resolveAuraHttpEndpoint(uri: string, database: string = 'neo4j'): string {
  let clean = (uri || '').trim();
  clean = clean.replace(/^(neo4j\+s|neo4j|bolt\+s|bolt|http):\/\//i, '');
  if (!clean.startsWith('https://') && !clean.startsWith('http://')) {
    clean = `https://${clean}`;
  }
  clean = clean.replace(/\/+$/, '');

  if (!clean.includes('/db/')) {
    return `${clean}/db/${database}/tx/commit`;
  }
  return clean;
}

/**
 * Load saved credentials from AsyncStorage with code fallback
 */
export async function getStoredAuraCredentials(): Promise<Neo4jCredentials> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CREDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        uri: parsed.uri || DEFAULT_AURA_CREDENTIALS.uri,
        username: parsed.username || DEFAULT_AURA_CREDENTIALS.username,
        password: parsed.password || DEFAULT_AURA_CREDENTIALS.password,
        database: parsed.database || DEFAULT_AURA_CREDENTIALS.database,
      };
    }
  } catch {}
  return { ...DEFAULT_AURA_CREDENTIALS };
}

/**
 * Save credentials to AsyncStorage
 */
export async function saveAuraCredentials(creds: Neo4jCredentials): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(creds));
  } catch (err) {
    console.warn('Failed to save Neo4j credentials:', err);
  }
}

/**
 * Executes an array of Cypher statements against Neo4j Aura transactional HTTP API
 */
export async function executeCypherStatements(
  credentials: Neo4jCredentials,
  statements: { statement: string; parameters?: Record<string, any> }[]
): Promise<{ success: boolean; data?: any; errors?: any[]; latencyMs: number }> {
  const endpoint = resolveAuraHttpEndpoint(credentials.uri, credentials.database || 'neo4j');
  const user = credentials.username || 'neo4j';
  const authHeader = `Basic ${toBase64(`${user}:${credentials.password}`)}`;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ statements }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.errors?.[0]?.message || errorText;
      } catch {}
      throw new Error(`Neo4j Aura HTTP ${response.status}: ${parsedError}`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      return { success: false, errors: json.errors, latencyMs };
    }

    return { success: true, data: json, latencyMs };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Ping test to verify connection to Neo4j Aura
 */
export async function testAuraConnection(credentials: Neo4jCredentials): Promise<{
  connected: boolean;
  message: string;
  latencyMs: number;
}> {
  if (!credentials.uri || !credentials.password) {
    return {
      connected: false,
      message: 'Please provide both Aura URI and Password.',
      latencyMs: 0,
    };
  }

  try {
    const res = await executeCypherStatements(credentials, [
      { statement: 'RETURN 1 AS ping, timestamp() AS serverTime' },
    ]);

    if (!res.success) {
      const err = res.errors?.[0]?.message || 'Query failed';
      return { connected: false, message: `Neo4j Error: ${err}`, latencyMs: res.latencyMs };
    }

    return {
      connected: true,
      message: `Successfully connected to Neo4j Aura! Response time: ${res.latencyMs}ms`,
      latencyMs: res.latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Failed to connect to Neo4j Aura.',
      latencyMs: 0,
    };
  }
}

/**
 * Builds the Cypher statements to MERGE user, accounts, merchants, mandates, and chained debits
 */
export function buildSyncStatements(
  mandates: Mandate[]
): { statement: string; parameters?: Record<string, any> }[] {
  const statements: { statement: string; parameters?: Record<string, any> }[] = [];

  // Statement 1: Merge Primary User and Core Accounts
  const totalAnnual = mandates.reduce((sum, m) => sum + (m.annualEstimate || 0), 0);
  statements.push({
    statement: `
      MERGE (u:User {id: "usr_finatic_active"})
      SET u.name = "Active Device User",
          u.annualBleed = $totalAnnual,
          u.lastSynced = timestamp()
      MERGE (acc1:Account {id: "acc_hdfc"})
      ON CREATE SET acc1.bank = "HDFC Bank", acc1.last4 = "1234", acc1.type = "SALARY"
      MERGE (acc2:Account {id: "acc_axis"})
      ON CREATE SET acc2.bank = "Axis Bank", acc2.last4 = "5678", acc2.type = "CREDIT_CARD"
      MERGE (acc3:Account {id: "acc_icici"})
      ON CREATE SET acc3.bank = "ICICI Bank", acc3.last4 = "9012", acc3.type = "SAVINGS"
      MERGE (u)-[:OWNS]->(acc1)
      MERGE (u)-[:OWNS]->(acc2)
      MERGE (u)-[:OWNS]->(acc3)
    `,
    parameters: { totalAnnual },
  });

  // Statement 2: Merge each Mandate, its Merchant, and Chained Debit Events
  mandates.forEach((m) => {
    const merchId = m.merchantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const accId = m.account?.includes('HDFC')
      ? 'acc_hdfc'
      : m.account?.includes('Axis')
      ? 'acc_axis'
      : 'acc_icici';

    statements.push({
      statement: `
        MERGE (merch:Merchant {id: $merchId})
        SET merch.name = $merchantName, merch.category = $category

        MERGE (desc:RawDescriptor {raw: $rawDescriptor})
        MERGE (desc)-[:RESOLVES_TO]->(merch)

        MERGE (mandate:Mandate {id: $mandateId})
        SET mandate.rail = $rail,
            mandate.frequency = $frequency,
            mandate.monthlyAmount = $monthlyAmount,
            mandate.annualAmount = $annualAmount,
            mandate.threatType = $threatType,
            mandate.status = $status,
            mandate.umrn = $umrn

        WITH mandate, merch
        MATCH (acc:Account {id: $accId})
        MERGE (acc)-[:HAS_MANDATE]->(mandate)
        MERGE (mandate)-[:CHARGED_BY]->(merch)

        MERGE (cancel:CancellationPath {rail: $rail})
        MERGE (mandate)-[:CANCELLED_VIA]->(cancel)
      `,
      parameters: {
        merchId,
        merchantName: m.merchantName,
        category: m.category || 'General',
        rawDescriptor: m.rawDescriptor || m.merchantName,
        mandateId: m.id,
        rail: m.paymentRail,
        frequency: m.frequency,
        monthlyAmount: m.monthlyEstimate || 0,
        annualAmount: m.annualEstimate || 0,
        threatType: m.threatType,
        status: m.status,
        umrn: m.umrn || 'UMRN_PENDING',
        accId,
      },
    });

    // Chained Debit Events
    if (m.chargeHistory && m.chargeHistory.length > 0) {
      const history = m.chargeHistory.slice(-4);
      for (let i = 0; i < history.length; i++) {
        const ev = history[i];
        statements.push({
          statement: `
            MATCH (mandate:Mandate {id: $mandateId})
            MERGE (ev:DebitEvent {id: $evId})
            SET ev.amount = $amount, ev.date = $date
            MERGE (mandate)-[:BILLED]->(ev)
          `,
          parameters: {
            mandateId: m.id,
            evId: ev.id || `${m.id}_ev_${i}`,
            amount: ev.amount,
            date: ev.date,
          },
        });

        // Link to previous charge (Chained Time-Series)
        if (i > 0) {
          const prevEv = history[i - 1];
          statements.push({
            statement: `
              MATCH (t1:DebitEvent {id: $prevId}), (t2:DebitEvent {id: $currId})
              MERGE (t1)-[r:NEXT_DEBIT]->(t2)
              SET r.hike = (t2.amount - t1.amount)
            `,
            parameters: {
              prevId: prevEv.id || `${m.id}_ev_${i - 1}`,
              currId: ev.id || `${m.id}_ev_${i}`,
            },
          });
        }
      }
    }
  });

  return statements;
}

/**
 * Synchronizes local mandates to live Neo4j Aura database and immediately
 * executes live Cypher analytics to return real threats discovered by the graph!
 */
export async function syncAndAuditWithNeo4jAura(
  credentials: Neo4jCredentials,
  mandates: Mandate[]
): Promise<AuraSyncResult> {
  try {
    // 1. Build and execute batch sync
    const syncStatements = buildSyncStatements(mandates);
    const syncRes = await executeCypherStatements(credentials, syncStatements);

    if (!syncRes.success) {
      return {
        success: false,
        message: syncRes.errors?.[0]?.message || 'Failed to sync graph to Neo4j',
        latencyMs: syncRes.latencyMs,
      };
    }

    // 2. Execute Live Threat Queries on the newly synced graph
    const analyticStatements = [
      // Statement 1: Detect Stealth Price Creeps
      {
        statement: `
          MATCH (m:Merchant)<-[:CHARGED_BY]-(man:Mandate)-[:BILLED]->(t1:DebitEvent)-[h:NEXT_DEBIT]->(t2:DebitEvent)
          WHERE t2.amount > t1.amount
          RETURN DISTINCT m.name AS service, t1.amount AS oldPrice, t2.amount AS newPrice, (t2.amount - t1.amount) AS hike
        `,
      },
      // Statement 2: Detect Duplicate Subscriptions across accounts
      {
        statement: `
          MATCH (u:User)-[:OWNS]->(acc:Account)-[:HAS_MANDATE]->(man:Mandate)-[:CHARGED_BY]->(m:Merchant)
          WITH m, count(DISTINCT acc) AS subCount, collect(DISTINCT acc.bank) AS accounts
          WHERE subCount > 1
          RETURN m.name AS service, subCount, accounts
        `,
      },
      // Statement 3: Graph Metrics (Node & Relationship Counts)
      {
        statement: `
          MATCH (n) WITH count(n) AS nodeCount
          MATCH ()-[r]->() WITH nodeCount, count(r) AS relCount
          RETURN nodeCount, relCount
        `,
      },
    ];

    const auditRes = await executeCypherStatements(credentials, analyticStatements);

    if (!auditRes.success) {
      return {
        success: true,
        message: 'Graph synced to Neo4j Aura, but threat analytics returned an error.',
        latencyMs: syncRes.latencyMs + auditRes.latencyMs,
      };
    }

    // Parse Neo4j JSON responses
    const results = auditRes.data?.results || [];

    // Parse Price Hikes
    const hikeRows = results[0]?.data || [];
    const stealthHikes = hikeRows.map((r: any) => ({
      service: r.row[0],
      oldPrice: Number(r.row[1]),
      newPrice: Number(r.row[2]),
      hike: Number(r.row[3]),
    }));

    // Parse Duplicate Subs
    const dupRows = results[1]?.data || [];
    const duplicateSubs = dupRows.map((r: any) => ({
      service: r.row[0],
      subCount: Number(r.row[1]),
      accounts: r.row[2] || [],
    }));

    // Parse Metrics
    const metricRow = results[2]?.data?.[0]?.row || [0, 0];
    const nodeCount = Number(metricRow[0]) || 0;
    const relCount = Number(metricRow[1]) || 0;

    return {
      success: true,
      message: `Graph synced & audited in ${syncRes.latencyMs + auditRes.latencyMs}ms. Found ${stealthHikes.length} stealth price hike(s) and ${duplicateSubs.length} duplicate subscription(s).`,
      latencyMs: syncRes.latencyMs + auditRes.latencyMs,
      threats: {
        stealthHikes,
        duplicateSubs,
        nodeCount,
        relCount,
      },
      rawResponse: auditRes.data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Sync to Neo4j failed',
      latencyMs: 0,
    };
  }
}

/**
 * Generates an executable Cypher script that populates the complete
 * Financial Knowledge Graph for manual inspection in Neo4j Browser.
 */
export function generateCypherSeedScript(mandates: Mandate[]): string {
  const stmts = buildSyncStatements(mandates);
  return stmts.map((s) => s.statement.trim()).join(';\n\n') + ';';
}
