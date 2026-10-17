import { Platform, PermissionsAndroid, NativeModules, Alert } from 'react-native';
import { SMSMessage } from '../types/sms';
import { parseSMS } from './smsParser';
import { getStoredSMSMessages, saveSMSMessages, setLastScanTimestamp } from './smsStorage';
import { generateRandomIncomingSMS } from './mockData';

export interface ScanResult {
  newMessagesCount: number;
  allMessages: SMSMessage[];
  isNative: boolean;
  permissionGranted: boolean;
}

/**
 * Checks whether native SMS reading is available (present in APK / dev build, absent in Expo Go)
 */
export function isNativeSMSAvailable(): boolean {
  return Platform.OS === 'android' && Boolean(NativeModules.Sms);
}

/**
 * Requests Android READ_SMS permission
 */
export async function requestSMSPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
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
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting SMS permission:', err);
    return false;
  }
}

/**
 * Checks if SMS permission is already granted
 */
export async function checkSMSPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
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
              const mapped: SMSMessage[] = list.map((item: any) => ({
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
