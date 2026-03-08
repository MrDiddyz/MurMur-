export function isWalletAvailable() {
  return typeof window !== 'undefined' && 'ethereum' in window;
}
