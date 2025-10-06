## Pointing frontend to backend

By default the API client uses `EXPO_PUBLIC_API_BASE_URL` if provided, otherwise `http://localhost:8000/api`.

Set an env var when running Expo:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api npx expo start
```

On Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = "http://localhost:8000/api"; npx expo start
```

If running on a real device, replace `localhost` with your machine's IP on the same network, e.g. `http://192.168.1.10:8000/api`.

## Disable mock API

The app currently starts MSW mocks in `app/_layout.tsx` via `startMocks()`. To call the real backend, comment out the call or guard it behind an env flag.

Example change:

```diff
 useEffect(() => {
-  startMocks();
+  if (!process.env.EXPO_PUBLIC_USE_MOCKS) {
+    // no mocks, call real backend
+  } else {
+    startMocks();
+  }
 }, []);
```

Start without mocks:

```powershell
$env:EXPO_PUBLIC_USE_MOCKS = "0"; npx expo start
```

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Reforestation Challenges & Rewards module

- Works out-of-the-box with mock data (no backend).
- MSW is initialized automatically on app start (web via Service Worker, native via Axios in-memory adapter).
- Tabs include Challenges and Rewards. Stack includes Challenge detail and Create screens.

Run on Web or Android:

```bash
npm install
npx expo start
# then press w (web) or a (Android)
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
