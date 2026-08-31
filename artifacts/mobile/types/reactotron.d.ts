import type { ReactotronReactNative } from 'reactotron-react-native';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Console {
    /**
     * Reactotron client, attached in `reactotron.config.ts`.
     * Only present in dev builds — guard with `__DEV__` or optional chaining.
     */
    tron: ReactotronReactNative;
  }
}

export {};
