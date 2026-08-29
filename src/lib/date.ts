const DEFAULT_TIME_ZONE = 'Asia/Kolkata';

/** Format an API instant as a local calendar date without exposing time/UTC details. */
export function formatDateOnly(value: unknown, timeZone = DEFAULT_TIME_ZONE): string {
  if (!value) return '-';
  const raw = String(value);
  if (!raw) return '-';

  // Date inputs and legacy date-only values are already calendar dates.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year = 0, month = 1, day = 1] = raw.split('-').map(Number);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone,
  }).format(parsed);
}

/** Normalize a value for an HTML date input without applying browser-local timezone rules. */
export function toDateInputValue(value: unknown, timeZone = DEFAULT_TIME_ZONE): string {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(parsed);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
