/**
 * Timezone-Safe Date and Week Management Utilities for APEX 100
 */

/**
 * Returns YYYY-MM-DD in local user timezone (avoids UTC toISOString mismatch)
 */
export function getLocalDateString(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shifts date by N days (+1 for tomorrow, -1 for yesterday)
 */
export function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Formats a date string for display (e.g., "Today, Aug 19", "Yesterday, Aug 18")
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const today = getLocalDateString();
  const yesterday = shiftDate(today, -1);
  const tomorrow = shiftDate(today, 1);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const month = monthNames[dateObj.getMonth()];
  const dayNum = dateObj.getDate();
  const dayName = dayNames[dateObj.getDay()];

  if (dateStr === today) return `Today (${month} ${dayNum})`;
  if (dateStr === yesterday) return `Yesterday (${month} ${dayNum})`;
  if (dateStr === tomorrow) return `Tomorrow (${month} ${dayNum})`;

  return `${dayName}, ${month} ${dayNum}`;
}

/**
 * Returns day-of-week key: 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
 */
export function getDayOfWeekKey(dateStr) {
  const [y, m, d] = (dateStr || getLocalDateString()).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return keys[dayIndex];
}

/**
 * Returns ISO week key (e.g. "2026-W34")
 */
export function getWeekIdentifier(dateStr) {
  const [y, m, d] = (dateStr || getLocalDateString()).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Returns week metadata and dates for a given date
 */
export function getWeekDays(dateStr) {
  const [y, m, d] = (dateStr || getLocalDateString()).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  // Monday is start of week
  const diffToMon = (day === 0 ? -6 : 1) - day;
  
  const monday = new Date(y, m - 1, d + diffToMon);
  const weekDays = [];
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateFormatted = getLocalDateString(current);
    weekDays.push({
      date: dateFormatted,
      id: dayKeys[i],
      name: dayNames[i],
      isToday: dateFormatted === getLocalDateString(),
    });
  }

  return {
    weekKey: getWeekIdentifier(dateStr),
    startDate: weekDays[0].date,
    endDate: weekDays[6].date,
    days: weekDays,
  };
}
