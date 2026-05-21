export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function toDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateKey(date);
}

export function getMonthStartDate() {
  const date = new Date();
  date.setDate(1);
  return toDateKey(date);
}
