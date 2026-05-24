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

/**
 * ISO weekday từ chuỗi YYYY-MM-DD (calendar VN khớp BE: trưa UTC).
 * Thứ 2 = 1 … Chủ nhật = 7.
 */
export function vnIsoWeekdayFromYmd(yyyyMmDd: string): number {
  const d = new Date(`${yyyyMmDd}T12:00:00.000Z`);
  const wd = d.getUTCDay();
  return wd === 0 ? 7 : wd;
}

/** Cộng/trừ số ngày lịch trên YYYY-MM-DD (trưa UTC, khớp @db.Date / BE). */
export function addVnCalendarDays(yyyyMmDd: string, deltaDays: number): string {
  const base = new Date(`${yyyyMmDd}T12:00:00.000Z`);
  return new Date(base.getTime() + deltaDays * 86_400_000).toISOString().slice(0, 10);
}

export type OverviewPeriodPreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth';

/** Khoảng from–to inclusive theo ngày VN (chuỗi gửi API dashboard). */
export function getOverviewPeriodRangeVN(preset: OverviewPeriodPreset): {
  from: string;
  to: string;
} {
  const today = todayVnDateString();

  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'yesterday': {
      const y = addVnCalendarDays(today, -1);
      return { from: y, to: y };
    }
    case 'thisWeek': {
      const iso = vnIsoWeekdayFromYmd(today);
      const from = addVnCalendarDays(today, -(iso - 1));
      return { from, to: today };
    }
    case 'lastWeek': {
      const iso = vnIsoWeekdayFromYmd(today);
      const thisMonday = addVnCalendarDays(today, -(iso - 1));
      const from = addVnCalendarDays(thisMonday, -7);
      const to = addVnCalendarDays(from, 6);
      return { from, to };
    }
    case 'thisMonth': {
      const [yStr, moStr] = today.split('-');
      return { from: `${yStr}-${moStr}-01`, to: today };
    }
    case 'lastMonth': {
      const [yStr, moStr] = today.split('-');
      let y = Number(yStr);
      let m = Number(moStr) - 1;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      const mm = String(m).padStart(2, '0');
      const from = `${y}-${mm}-01`;
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const dd = String(lastDay).padStart(2, '0');
      return { from, to: `${y}-${mm}-${dd}` };
    }
    default:
      return { from: today, to: today };
  }
}
