import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';

/**
 * Reactotron — dev-only inspector for API calls, logs, and AsyncStorage.
 *
 * Imported for its side effects from `app/_layout.tsx` behind `if (__DEV__)`, so it is
 * never bundled into a production build. It is pure JS with no native module, which is
 * why it works inside Expo Go.
 *
 * To see anything you need the desktop app running:
 *   brew install --cask reactotron
 * and, for the Android emulator, a port forward the same way Metro gets one:
 *   adb reverse tcp:9090 tcp:9090
 * The iOS simulator reaches localhost directly and needs no forward.
 *
 * `services/api.ts` needs no changes — the networking plugin patches XHR, and React
 * Native implements fetch on top of XHR, so every call through the wrapper shows up.
 */
const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'Qar',
    // onConnect fires once the desktop app is listening.
    onConnect: () => reactotron.clear?.(),
  })
  .useReactNative({
    networking: {
      // Metro's own traffic would otherwise drown out the app's API calls.
      ignoreUrls: /symbolicate|logs|hot-update|127\.0\.0\.1:8082|localhost:8082/,
    },
    errors: { veto: frame => frame.fileName.indexOf('/node_modules/react-native/') >= 0 },
    editor: false,
    overlay: false,
  })
  .connect();

// `console.tron.log(...)` from anywhere; see types/reactotron.d.ts.
console.tron = reactotron;

export default reactotron;
