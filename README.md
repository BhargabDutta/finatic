# ⚡ FINATIC // ON-DEVICE SMS FINANCIAL RADAR

<p align="center">
  <img src="assets/logo.png" alt="Finatic Logo" width="140" height="140" style="border: 3px solid black; box-shadow: 4px 4px 0px #000;" />
</p>

<p align="center">
  <b>A High-Contrast Neo-Brutalist Android App that Scans Incoming SMS Every 3 Minutes to Provide Live Financial Intelligence, Expense Tracking, and Transaction Analytics.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PLATFORM-ANDROID-00E575?style=for-the-badge&logo=android&logoColor=black" alt="Android" />
  <img src="https://img.shields.io/badge/FRAMEWORK-REACT_NATIVE_/_EXPO-FFE600?style=for-the-badge&logo=expo&logoColor=black" alt="Expo" />
  <img src="https://img.shields.io/badge/STYLE-NEO--BRUTALIST-FF3366?style=for-the-badge" alt="Brutalist" />
  <img src="https://img.shields.io/badge/PRIVACY-100%25_ON--DEVICE-00F0FF?style=for-the-badge" alt="Privacy" />
</p>

---

## 📱 App Screenshots (Live Device Capture)

<p align="center">
  <img src="assets/screenshot_synced.png" alt="Finatic Home Dashboard" width="45%" style="border: 3px solid black; margin-right: 10px;" />
  <img src="assets/screenshot_feed.png" alt="Finatic SMS Feed" width="45%" style="border: 3px solid black;" />
</p>

---

## ⚡ Core Features

### 1. 🔄 3-Minute Periodic Inbox Scanner
- **Live Countdown Timer**: Counts down from `03:00` to `00:00` with an animated progress bar.
- **Auto-Sync**: Automatically scans incoming SMS every 3 minutes to detect new bank transactions, OTPs, or bill reminders.
- **Force Scan**: Instant manual `SCAN INBOX` trigger button for real-time rescan on demand.
- **Foreground & Background Engine**: Runs in-app with precision timers and native background scheduling.

### 2. 🧠 High-Precision Financial NLP & Regex Engine
- **Transaction Types Detected**:
  - `DEBIT`: Bank debits, UPI transfers, card swipes, ATM withdrawals, online shopping.
  - `CREDIT`: Salary deposits, incoming UPI, refunds, interest credits.
  - `BILL_DUE`: Credit card statements, utility/broadband bills, minimum dues with due dates.
  - `OTP_AUTH`: Two-factor authentication codes and banking OTPs.
  - `INVESTMENT`: Mutual fund SIPs, stock transactions, demat updates, dividends.
  - `PROMOTIONAL`: Pre-approved loan offers, marketing spam, discount vouchers.
- **Entity Extraction**:
  - **Amount & Currency**: Handles `₹`, `$`, `€`, `£`, `INR`, `USD`, `EUR`, `GBP`.
  - **Merchants & Entities**: Identifies merchants (Swiggy, Zomato, Starbucks, Amazon, Uber, Netflix, etc.) and counterparties.
  - **Account / Card Digits**: e.g., `A/c XX4029`, `Card ending 3014`.
  - **Available Balance**: Automatically tracks balance remaining after transactions.
  - **Reference Numbers**: UTR, UPI Ref, and Transaction IDs.

### 3. 📊 Brutalist Financial Intelligence Dashboard
- **Net Financial Flow**: Massive surplus (`+`) or deficit (`-`) card showing live net cash flow.
- **Total Inflow vs Outflow**: Split metric blocks for total debits and credits.
- **Expense By Category**: Visual bar chart breaking down spend across Food & Dining, Shopping, Utilities, Commute, Groceries, and Entertainment.
- **SMS Type Radar**: Multi-segment visual distribution bar analyzing the ratio of financial vs security vs spam messages.
- **Urgent Alerts**: Warning callouts for upcoming bills due and high-outflow transactions.

### 4. 🔒 100% Privacy-First Architecture
- **Zero Cloud Leak**: Every regex and NLP calculation runs **strictly on-device**.
- **No Remote Servers**: Your SMS messages never leave your phone.

---

## 🚀 How to Share with Friends

You can send the compiled standalone APK (**`finatic.apk`**) directly to anyone with an Android phone!

### Step 1: Send the APK File
The APK file is located in the project root:
```
c:\Users\maniac\Desktop\finatic\finatic.apk
```
Send it via any of the following:
- **WhatsApp Web / Telegram**: Drag and drop `finatic.apk` into a chat.
- **Google Drive / OneDrive**: Upload `finatic.apk` and share the link.
- **Quick Share / Nearby Share / Bluetooth**: Send directly from phone to phone.
- **USB Cable**: Copy `finatic.apk` directly to their phone's *Downloads* folder.

### Step 2: How Friends Install It
1. On their Android phone, tap the received **`finatic.apk`**.
2. If prompted *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source** ON.
   - Tap **Install**.
3. Open **Finatic**.
4. Tap **GRANT SMS ACCESS** and choose **Allow** when the Android permission dialog appears.
5. Tap **SCAN INBOX** — their real phone SMS inbox will immediately be analyzed, categorized, and visualized!

---

## 🛠️ Developer & Build Guide

### Prerequisites
- Node.js 18+ (tested on Node v22)
- Android SDK with platform-tools
- Java JDK 17 (Temurin 17)

### Install Dependencies
```bash
npm install
```

### Run Parser Unit Tests
Verify entity extraction across 7 diverse bank SMS formats:
```bash
npm run test:parser
```

### Run with Expo Development Server
```bash
npx expo start --tunnel
```

### Build a Fresh Standalone APK
To regenerate the embedded bundle and recompile the APK:
```powershell
# 1. Embed JavaScript bundle into Android assets
npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# 2. Compile APK using Gradle
cd android
.\gradlew.bat assembleDebug --no-daemon
cd ..

# 3. Copy APK to root
Copy-Item 'android\app\build\outputs\apk\debug\app-debug.apk' -Destination 'finatic.apk' -Force
```

### Install Directly to Connected Phone via ADB
```powershell
& "C:\Users\maniac\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r finatic.apk
```

---

## 📁 Project Architecture

```
finatic/
├── finatic.apk                              # Standalone compiled Android APK (ready to share)
├── assets/
│   ├── logo.png                             # Brutalist Financial Vault & Arrow logo
│   ├── screenshot_synced.png                # Live screenshot: Dashboard & Metrics
│   └── screenshot_feed.png                  # Live screenshot: Classified SMS Feed
├── android/
│   └── app/src/main/java/com/finatic/app/
│       ├── SmsModule.kt                     # Native Kotlin Telephony Content Provider Reader
│       ├── SmsPackage.kt                    # React Native Package Bridge
│       └── MainApplication.kt              # Native App Entry
├── src/
│   ├── types/
│   │   └── sms.ts                           # SMSMessage, ParsedFinancialData, ScanStats
│   ├── theme/
│   │   ├── colors.ts                        # Neo-Brutalist color tokens (Paper, Lime, Coral, Yellow)
│   │   └── styles.ts                        # Hard drop shadows (4px 4px 0px), borders, monospace
│   ├── services/
│   │   ├── smsParser.ts                     # Financial regex & NLP classification engine
│   │   ├── smsStorage.ts                    # AsyncStorage cache & analytics aggregation
│   │   ├── smsReader.ts                     # Native Android SMS bridge & permission requester
│   │   ├── scannerService.ts                # 3-minute interval scanner & background task
│   │   └── mockData.ts                      # Demo bank dataset & incoming SMS simulator
│   ├── components/
│   │   ├── brutalist/                       # BrutalistCard, BrutalistButton, BrutalistBadge, BrutalistHeader
│   │   ├── dashboard/                       # ScanStatusCard, FinancialSummaryCard, CategoryChart, Radar
│   │   ├── sms/                             # SMSCard, SMSDetailModal, SMSFilterBar
│   │   └── devtools/                        # TestSMSModal (incoming SMS simulator)
│   └── screens/
│       └── HomeScreen.tsx                   # Master dashboard & feed screen
└── README.md                                # Project documentation & sharing guide
```

---

## 📄 License
MIT License. Built with React Native, Expo, and Neo-Brutalist design principles.
