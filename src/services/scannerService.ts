import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { scanSMSInbox } from './smsReader';

export const BACKGROUND_SCAN_TASK = 'FINATIC_SMS_PERIODIC_SCAN_TASK';
export const SCAN_INTERVAL_SECONDS = 180; // Exactly 3 minutes

// Detect if running inside the sandboxed Expo Go app
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

// Register background task definition only for Android standalone / development builds
if (Platform.OS === 'android' && !isExpoGo) {
  try {
    TaskManager.defineTask(BACKGROUND_SCAN_TASK, async () => {
      try {
        const result = await scanSMSInbox(false);
        console.log(`[Finatic Background Task] Processed ${result.allMessages.length} SMS`);
        return result.newMessagesCount > 0
          ? BackgroundFetch.BackgroundFetchResult.NewData
          : BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        console.warn('[Finatic Background Task] Error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Registers background fetch periodic execution for native Android builds
 */
export async function registerBackgroundScan(): Promise<boolean> {
  // In Expo Go or non-Android, background fetch is restricted by Expo Go sandbox.
  // The foreground 3-minute timer handles periodic scanning while the app is active.
  if (Platform.OS !== 'android' || isExpoGo) {
    return false;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SCAN_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SCAN_TASK, {
        minimumInterval: SCAN_INTERVAL_SECONDS, // 3 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('[Finatic] Periodic 3-minute background task registered');
    }
    return true;
  } catch (error) {
    // Fail silently in restricted environments
    return false;
  }
}

/**
 * Unregisters background task
 */
export async function unregisterBackgroundScan(): Promise<void> {
  if (Platform.OS !== 'android' || isExpoGo) return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SCAN_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SCAN_TASK);
    }
  } catch (error) {
    // Fail silently
  }
}
