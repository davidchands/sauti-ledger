export function formatTSh(amount: number): string {
  return `TSh ${Math.round(amount).toLocaleString('en-TZ')}`
}
