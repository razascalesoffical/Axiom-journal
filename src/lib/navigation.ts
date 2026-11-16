const ALLOWED_EXTERNAL_HOSTS = new Set<string>([
  'discord.com',
  'www.discord.com',
  'instagram.com',
  'www.instagram.com'
]);

export function sanitizeExternalUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;
    if (!ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function openExternalUrl(rawUrl: string): void {
  const safeUrl = sanitizeExternalUrl(rawUrl);
  if (!safeUrl) return;

  try {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  } catch {
    // Popup blockers or restricted iframe sandboxes may reject programmatic window.open
  }
}
