export function formatRelativeVerifiedAt(timestampMs: number, now = Date.now()): string {
  const deltaSec = Math.max(0, Math.floor((now - timestampMs) / 1000));
  if (deltaSec < 60) {
    return 'Verified just now';
  }
  const minutes = Math.floor(deltaSec / 60);
  if (minutes < 60) {
    return `Verified ${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Verified ${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `Verified ${days}d ago`;
}
