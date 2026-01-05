# Build APK Guide for IssueX

This guide outlines the steps to build an Android APK for the **IssueX** application using Capacitor.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: (v16 or higher recommended)
- **Android Studio**: Installed and configured with the Android SDK.

## Step 1: Navigate to Client Directory

All build commands must be run from the `client` directory where the React app and Capacitor configuration live.

```bash
cd client
```

## Step 2: Install Dependencies

Ensure all project dependencies are installed.

```bash
npm install
```

## Step 3: Build the Web Application

Compile the React/Vite application. This generates the `dist` folder containing the web assets.

```bash
npm run build
```

> **Note:** If this step fails, ensure you have no syntax errors in your React code.

## Step 4: Sync with Capacitor

Copy the built web assets (from `dist`) and update the native Android project.

```bash
npx cap sync
```

## Step 5: Build the APK

You can build the APK using either the **Command Line** (faster) or **Android Studio** (visual).

### Option A: Command Line (Fastest)

1. Navigate to the android folder:
   ```bash
   cd android
   ```

2. Run the Gradle build command:
   **For Windows:**
   ```powershell
   ./gradlew assembleDebug
   ```
   *(Note: For a signed release APK, you would run `./gradlew assembleRelease`, but that requires keystore configuration.)*

3. **Locate the APK:**
   After the build finishes successfully, your APK will be located at:
   `client/android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Android Studio (Visual)

1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```

2. Wait for Android Studio to sync completely (watch the bottom progress bar).

3. To build the APK:
   - Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.

4. **Locate the APK:**
   - A notification will appear in the bottom right when complete. Click **"locate"** to open the folder containing the APK.

## Troubleshooting

- **"SDK location not found"**: Create a `local.properties` file in the `android` folder with `sdk.dir=C:\\Users\\<your_user>\\AppData\\Local\\Android\\Sdk` (update specific path).
- **Gradle Errors**: Try cleaning the project by running `./gradlew clean` inside the `android` directory before rebuilding.
