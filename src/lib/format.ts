/**
 * قالب‌بندی فارسی: اعداد، پول، تاریخ
 * همه‌ی خروجی‌ها برای نمایش در UI فارسی/راست‌چین مناسب‌اند.
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل ارقام انگلیسی به فارسی */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** تبدیل ارقام فارسی/عربی به انگلیسی (برای پردازش) */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** جداکننده هزارگان + واحد تومان: «۱۲٬۵۰۰٬۰۰۰ تومان» */
export function formatPrice(value: number, opts: { unit?: boolean } = {}): string {
  const { unit = true } = opts;
  const n = Math.round(Number(value) || 0);
  const grouped = Math.abs(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  const sign = n < 0 ? "−" : "";
  const text = `${sign}${toPersianDigits(grouped)}`;
  return unit ? `${text} تومان` : text;
}

/** فقط عدد با جداکننده */
export function formatNumber(value: number): string {
  const n = Math.round(Number(value) || 0);
  return toPersianDigits(
    Math.abs(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, "٬"),
  );
}

/** درصد: «۲۵٪» */
export function formatPercent(value: number): string {
  return `${toPersianDigits(Math.round(value))}٪`;
}

/** کوتاه‌کردن بزرگ: «۱٫۲ میلیون» */
export function formatCompactPrice(value: number): string {
  const n = Math.round(value);
  if (n >= 1_000_000_000) return `${toPersianDigits((n / 1_000_000_000).toFixed(1).replace(".", "٫"))} میلیارد`;
  if (n >= 1_000_000) return `${toPersianDigits((n / 1_000_000).toFixed(1).replace(".", "٫"))} میلیون`;
  if (n >= 1_000) return `${toPersianDigits((n / 1_000).toFixed(0))} هزار`;
  return toPersianDigits(n);
}

/** مدت زمان باقی‌مانده: «۲ ساعت و ۱۵ دقیقه» */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "به پایان رسید";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (days > 0) return `${toPersianDigits(days)} روز و ${toPersianDigits(hours)} ساعت`;
  if (hours > 0) return `${toPersianDigits(hours)}:${toPersianDigits(String(minutes).padStart(2, "0"))}:${toPersianDigits(String(seconds).padStart(2, "0"))}`;
  return `${toPersianDigits(minutes)}:${toPersianDigits(String(seconds).padStart(2, "0"))}`;
}

/** زمان نسبی: «۳ ساعت پیش» */
export function timeAgo(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "چند لحظه پیش";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${toPersianDigits(min)} دقیقه پیش`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${toPersianDigits(hr)} ساعت پیش`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${toPersianDigits(day)} روز پیش`;
  return formatDate(d);
}

// ------------------------------- تقویم فارسی ------------------------------

const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

/** تبدیل میلادی به شمسی — الگوریتم استاندارد jalaali (دقیق برای بازه ۱۳۵۰–۱۴۵۰) */
const div = (a: number, b: number) => Math.trunc(a / b);
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b;

function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  let bl = breaks.length;
  let gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;
  let n: number;
  let i: number;

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

export function toJalali(date: Date): { y: number; m: number; d: number } {
  const { jy, jm, jd } = d2j(g2d(date.getFullYear(), date.getMonth() + 1, date.getDate()));
  return { y: jy, m: jm, d: jd };
}

/** «۱۴۰۴/۰۸/۱۷» */
export function formatDate(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const { y, m, d: day } = toJalali(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return toPersianDigits(`${y}/${pad(m)}/${pad(day)}`);
}

/** «۱۷ آبان ۱۴۰۴» */
export function formatDateLong(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const { y, m, d: day } = toJalali(d);
  return toPersianDigits(`${day} ${MONTHS[m - 1]} ${y}`);
}

/** نام روز هفته */
export function weekdayName(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return WEEKDAYS[d.getDay()];
}

/** «۱۷ آبان — ساعت ۱۴:۳۰» */
export function formatDateTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDateLong(d)} — ساعت ${toPersianDigits(`${hh}:${mm}`)}`;
}

/** نام ماه فارسی */
export function jalaliMonthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

/** شماره سفارش فارسی‌شده برای نمایش */
export function formatOrderNumber(value: string): string {
  return toPersianDigits(value);
}

/** نمایش امتیاز: «۴٫۵ از ۵» */
export function formatRating(value: number): string {
  return toPersianDigits(value.toFixed(1).replace(".", "٫"));
}

/** تعداد بازدید: «۱٫۲ هزار بازدید» */
export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${toPersianDigits((value / 1_000_000).toFixed(1).replace(".", "٫"))} میلیون`;
  if (value >= 1_000) return `${toPersianDigits((value / 1_000).toFixed(1).replace(".", "٫"))} هزار`;
  return toPersianDigits(value);
}
