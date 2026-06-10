export {};

declare global {
  interface Window {
    __NEXT_PUBLIC_POLLING_INTERVAL__?: string;
  }
}
