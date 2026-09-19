export interface CourseStart {
  course: string;
  start: string;
  deadline: string;
}

export const muutosturvaStarts: CourseStart[] = [
  { course: "Tekoälykoordinaattori", start: "2026-10-13", deadline: "2026-10-05" },
  { course: "Tekoälykoordinaattori", start: "2026-11-10", deadline: "2026-11-02" },
  { course: "Tekoälykoordinaattori", start: "2027-01-12", deadline: "2027-01-04" },
];

const timestamp = (date: string) => Date.parse(`${date}T00:00:00Z`);
export function nextCourseStart(now = new Date(), starts = muutosturvaStarts) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  const today = timestamp(`${part("year")}-${part("month")}-${part("day")}`);
  return starts.filter(s => timestamp(s.start) > today).sort((a, b) => timestamp(a.start) - timestamp(b.start))[0];
}
export function formatCourseDate(date: string) {
  return new Intl.DateTimeFormat("fi-FI", { timeZone: "UTC", day: "numeric", month: "numeric", year: "numeric" }).format(new Date(timestamp(date)));
}

export function deadlinePassed(deadline: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value;
  return timestamp(deadline) < timestamp(`${part("year")}-${part("month")}-${part("day")}`);
}
