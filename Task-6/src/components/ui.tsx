import type { ReactNode } from "react";
import { initials, type ProjectStatus } from "../data/mock";

const statusStyles: Record<ProjectStatus, { badge: string; dot: string }> = {
  "In progress": { badge: "bg-blue-soft text-blue", dot: "bg-blue" },
  "In review": { badge: "bg-amber-soft text-amber", dot: "bg-amber" },
  Completed: { badge: "bg-green-soft text-green", dot: "bg-green" },
  "On hold": { badge: "bg-red-soft text-red", dot: "bg-red" },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = statusStyles[status];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium ${s.badge}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function ProgressBar({ value, status }: { value: number; status: ProjectStatus }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-raised"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
      >
        <div className={`h-full rounded-full ${statusStyles[status].dot}`} style={{ width: `${value}%` }} />
      </div>
      <span className="num w-9 shrink-0 text-right text-xs text-muted">{value}%</span>
    </div>
  );
}

const avatarTones = [
  "bg-accent-soft text-accent",
  "bg-teal-soft text-teal",
  "bg-amber-soft text-amber",
  "bg-pink-soft text-pink",
  "bg-blue-soft text-blue",
];

export function ClientAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const tone = avatarTones[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-lg font-semibold ${tone} ${
        size === "sm" ? "size-8 text-[11px]" : "size-9 text-xs"
      }`}
    >
      {initials(name)}
    </span>
  );
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">{title}</h1>
        <p className="mt-1.5 text-[15px] text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
