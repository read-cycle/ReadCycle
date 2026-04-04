export function normalizeImageUrl(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function normalizeImageUrlList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export function getDisplayImageUrl(primary?: string | null, fallback?: string | null): string {
  return primary || fallback || '';
}
