import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { SMSMessage } from '../types/sms';
import { parseSMS, isAutoPaymentSMS } from './smsParser';
import { getStoredSMSMessages, saveSMSMessages, setLastScanTimestamp } from './smsStorage';
import { generateRandomIncomingSMS } from './mockData';

export interface ScanResult {
  newMessagesCount: number;
  allMessages: SMSMessage[];
  isNative: boolean;
  permissionGranted: boolean;
}

export interface PermissionResult {
  granted: boolean;
  reason?: 'EXPO_GO' | 'NOT_ANDROID' | 'DENIED';
}

/**
 * Checks if running inside Expo Go client app (which lacks READ_SMS in its Google Play manifest)
 */
export const isRunningInExpoGo: boolean = Boolean(
  Constants && (
    (Constants as any).appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  )
);

/**
 * Checks whether native SMS reading is available (present in APK / dev build, absent in Expo Go)
 */
export function isNativeSMSAvailable(): boolean {
  if (isRunningInExpoGo) {
    return false;
  }
  return Platform.OS === 'android' && Boolean(NativeModules.Sms);
}

/**
 * Requests Android READ_SMS permission
 */
export async function requestSMSPermissions(): Promise<PermissionResult> {
  if (isRunningInExpoGo) {
    return { granted: false, reason: 'EXPO_GO' };
  }

  if (Platform.OS !== 'android') {
    return { granted: false, reason: 'NOT_ANDROID' };
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission Required',
        message: 'Finatic needs permission to read your incoming SMS inbox to categorize transactions and detect expenses.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    return {
      granted: isGranted,
      reason: isGranted ? undefined : 'DENIED',
    };
  } catch (err) {
    console.warn('Error requesting SMS permission:', err);
    return { granted: false, reason: 'DENIED' };
  }
}

/**
 * Checks if SMS permission is already granted
 */
export async function checkSMSPermission(): Promise<boolean> {
  if (isRunningInExpoGo || Platform.OS !== 'android') {
    return false;
  }

  try {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  } catch {
    return false;
  }
}

/**
 * Reads SMS inbox on Android or returns synced stored/mock messages.
 * In production standalone builds with native telephony, queries the telephony provider.
 * In Expo Go / Web / Dev mode, merges existing stored messages with simulated incoming live messages.
 */
export async function scanSMSInbox(simulateIncomingOnScan: boolean = false): Promise<ScanResult> {
  const isAndroid = Platform.OS === 'android';
  let permissionGranted = false;

  if (isAndroid) {
    permissionGranted = await checkSMSPermission();
  }

  const nativeSms = NativeModules.Sms;

  if (isAndroid && permissionGranted && nativeSms) {
    try {
      const nativeMessages: SMSMessage[] = await new Promise((resolve, reject) => {
        nativeSms.list(
          JSON.stringify({
            box: 'inbox',
            maxCount: 200,
          }),
          (fail: string) => {
            console.warn('Native SMS list error:', fail);
            reject(new Error(fail));
          },
          (count: number, smsList: string) => {
            try {
              const list = JSON.parse(smsList);
              // PRIVACY SHIELD: Filter strictly for auto-payment / recurring mandate messages.
              // All OTPs, personal P2P transfers, and non-recurring transactions are discarded in-memory.
              const autoPaymentOnly = list.filter((item: any) =>
                isAutoPaymentSMS(item.body || '', item.address || '')
              );

              const mapped: SMSMessage[] = autoPaymentOnly.map((item: any) => ({
                id: item._id?.toString() || `${item.date}-${Math.random()}`,
                address: item.address || 'Unknown',
                body: item.body || '',
                date: item.date ? parseInt(item.date, 10) : Date.now(),
                read: item.read === 1,
                parsed: parseSMS(item.body || '', item.address || ''),
                isSimulated: false,
              }));
              resolve(mapped);
            } catch (e) {
              reject(e);
            }
          }
        );
      });

      await saveSMSMessages(nativeMessages);
      await setLastScanTimestamp(Date.now());

      return {
        newMessagesCount: nativeMessages.length,
        allMessages: nativeMessages,
        isNative: true,
        permissionGranted: true,
      };
    } catch (e) {
      console.warn('Native SMS read failed, falling back to stored/simulated messages:', e);
    }
  }

  // Fallback / Expo Go / Simulator mode
  const stored = await getStoredSMSMessages();
  let updatedMessages = [...stored];
  let newMessagesCount = 0;

  if (simulateIncomingOnScan) {
    // Inject a realistic new bank/merchant transaction to demonstrate real-time discovery
    const newMsg = generateRandomIncomingSMS();
    updatedMessages = [newMsg, ...stored];
    newMessagesCount = 1;
    await saveSMSMessages(updatedMessages);
  }

  await setLastScanTimestamp(Date.now());

  return {
    newMessagesCount,
    allMessages: updatedMessages,
    isNative: false,
    permissionGranted,
  };
}
