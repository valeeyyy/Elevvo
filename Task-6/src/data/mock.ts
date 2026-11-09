export type ProjectStatus = "In progress" | "In review" | "Completed" | "On hold";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  deadline: string; // ISO date
  budget: number;
  progress: number; // 0–100
}

export interface Activity {
  id: string;
  text: string;
  detail: string;
  time: string;
}

export const projects: Project[] = [
  { id: "p1", name: "Brand refresh", client: "Northwind Coffee", status: "In progress", deadline: "2026-11-08", budget: 4200, progress: 45 },
  { id: "p2", name: "Booking web app", client: "Atlas Physio", status: "In review", deadline: "2026-11-02", budget: 7800, progress: 90 },
  { id: "p3", name: "Product photography", client: "Kiln & Co.", status: "Completed", deadline: "2026-10-14", budget: 1600, progress: 100 },
  { id: "p4", name: "Marketing site", client: "Halden Studio", status: "In progress", deadline: "2026-11-21", budget: 5400, progress: 30 },
  { id: "p5", name: "Newsletter templates", client: "Grove Journal", status: "On hold", deadline: "2026-12-05", budget: 950, progress: 15 },
  { id: "p6", name: "Mobile onboarding", client: "Pennant Finance", status: "In progress", deadline: "2026-12-12", budget: 6300, progress: 20 },
  { id: "p7", name: "Pitch deck", client: "Ferro Labs", status: "Completed", deadline: "2026-09-30", budget: 1200, progress: 100 },
];

export const monthlyEarnings = [
  { month: "May", amount: 3800 },
  { month: "Jun", amount: 4650 },
  { month: "Jul", amount: 4100 },
  { month: "Aug", amount: 5900 },
  { month: "Sep", amount: 5200 },
  { month: "Oct", amount: 6750 },
];

export const activities: Activity[] = [
  { id: "a1", text: "Atlas Physio approved the booking flow", detail: "Booking web app", time: "2h ago" },
  { id: "a2", text: "Invoice #1042 was paid", detail: "Kiln & Co. · $1,600", time: "Yesterday" },
  { id: "a3", text: "New comment on homepage draft", detail: "Marketing site", time: "2 days ago" },
  { id: "a4", text: "Pennant Finance shared new copy", detail: "Mobile onboarding", time: "3 days ago" },
  { id: "a5", text: "Project put on hold", detail: "Newsletter templates", time: "Last week" },
];

export const notifications = activities.slice(0, 3);

export const tasksDue = 6;

export const taskTypes = [
  { type: "Design", count: 14 },
  { type: "Development", count: 11 },
  { type: "Client calls", count: 6 },
  { type: "Admin", count: 4 },
];

export const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const DAY = 86_400_000;

/** Days from today until an ISO date (negative when in the past). */
export function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / DAY);
}

/** Human-friendly deadline, e.g. "In 3 days", "2d overdue", "Delivered". */
export function relativeDeadline(iso: string, status: ProjectStatus) {
  if (status === "Completed") return "Delivered";
  const days = daysUntil(iso);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

export const initials = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
