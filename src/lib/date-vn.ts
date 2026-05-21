/** Múi giờ cố định cho chuẩn hoá ngày theo khu vực VN (không DST): UTC+7 */
export const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

const VN_TZ = 'Asia/Ho_Chi_Minh';

/** Chuỗi YYYY-MM-DD (đọc từ API / @db.Date) */
export function formatVnDateString(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  // @db.Date lưu noon UTC
  if (
    date.getUTCHours() === 12 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  ) {
    return date.toISOString().slice(0, 10);
  }
  return date.toLocaleDateString('en-CA', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function vnDateTimeParts(d: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** HH:mm theo giờ VN (hiển thị danh sách) */
export function formatVnTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const { hour, minute } = vnDateTimeParts(d);
  return `${hour}:${minute}`;
}

/** ISO → chuỗi cho input datetime-local (giờ VN, YYYY-MM-DDTHH:mm) */
export function isoToVnInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const { year, month, day, hour, minute } = vnDateTimeParts(d);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** datetime-local (giờ VN) → ISO UTC */
export function vnInputToIso(local: string): string {
  const [datePart, timePart = '00:00'] = local.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  // Giờ local VN → UTC: trừ 7h
  return new Date(Date.UTC(y, m - 1, d, hh - 7, mm)).toISOString();
}

/** Hôm nay (theo VN) dạng YYYY-MM-DD */
export function todayVnDateString(): string {
  const now = new Date();
  const vnTime = new Date(now.getTime() + VN_OFFSET_MS);
  const y = vnTime.getUTCFullYear();
  const m = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
