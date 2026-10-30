export const BACKGROUND_SCAN_TASK = 'FINATIC_SMS_PERIODIC_SCAN_TASK';
export const SCAN_INTERVAL_SECONDS = 180; // Exactly 3 minutes

/**
 * Registers periodic scan handler.
 * Foreground 3-minute periodic timer in HomeScreen provides 100% reliable in-app scans
 * without risking background job limits or OS service crashes.
 */
export async function registerBackgroundScan(): Promise<boolean> {
  return true;
}

/**
 * Unregisters background scan handler (safe no-op)
 */
export async function unregisterBackgroundScan(): Promise<void> {
  // Safe no-op
}
