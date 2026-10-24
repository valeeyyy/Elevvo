import { STATUSES, STATUS_LABEL } from "../types/job";
import type { Column, Status } from "../types/job";

export const STATUS_DOT: Readonly<Record<Status, string>> = {
  applied: "bg-info",
  interviewing: "bg-notice",
  offer: "bg-positive",
  rejected: "bg-negative",
};

export interface StatsBarProps {
  columns: readonly Column[];
  isLoading: boolean;
}

export function StatsBar({ columns, isLoading }: StatsBarProps) {
  const countFor = (status: Status): number => columns.find((column) => column.id === status)?.jobs.length ?? 0;
  const total = columns.reduce((sum, column) => sum + column.jobs.length, 0);
  const display = (value: number): string => (isLoading ? "–" : String(value));

  const stats: readonly { label: string; value: number }[] = [
    { label: "Total", value: total },
    ...STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: countFor(status) })),
  ];

  return (
    <dl data-testid="stats" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.label === "Total" ? "col-span-2 sm:col-span-3 lg:col-span-1 " : ""}rounded-card bg-surface px-5 py-4 shadow-card`}>
          <dd className="num font-display text-[32px] font-semibold leading-none text-ink">{display(stat.value)}</dd>
          <dt className="mt-2 text-[13px] font-medium text-muted">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
