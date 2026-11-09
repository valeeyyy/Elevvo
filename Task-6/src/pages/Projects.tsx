import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { projects, shortDate, currency, daysUntil, relativeDeadline, type Project } from "../data/mock";
import StatusBadge, { ClientAvatar, PageHeader, ProgressBar } from "../components/ui";

const filters = ["All", "In progress", "In review", "Completed", "On hold"] as const;
type Filter = (typeof filters)[number];

const isOpen = (p: Project) => p.status !== "Completed";
const overdueCount = projects.filter((p) => isOpen(p) && daysUntil(p.deadline) < 0).length;

const summary = [
  { label: "Active", dot: "bg-accent", value: String(projects.filter((p) => p.status === "In progress" || p.status === "In review").length) },
  { label: "Completed", dot: "bg-green", value: String(projects.filter((p) => p.status === "Completed").length) },
  { label: "Overdue", dot: "bg-red", value: String(overdueCount), alert: overdueCount > 0 },
  { label: "Total value", dot: "bg-teal", value: currency(projects.reduce((s, p) => s + p.budget, 0)) },
];

function Deadline({ project, stacked = true }: { project: Project; stacked?: boolean }) {
  const overdue = isOpen(project) && daysUntil(project.deadline) < 0;
  const rel = relativeDeadline(project.deadline, project.status);
  return stacked ? (
    <>
      <p className="num">{shortDate(project.deadline)}</p>
      <p className={`num mt-0.5 text-xs ${overdue ? "text-red" : "text-faint"}`}>{rel}</p>
    </>
  ) : (
    <span className="num flex items-center gap-1.5 text-muted">
      <CalendarClock size={14} strokeWidth={1.8} className="text-faint" aria-hidden="true" />
      {shortDate(project.deadline)}
      <span className={overdue ? "text-red" : "text-faint"}>({rel})</span>
    </span>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <PageHeader title="Projects" description="Current and past client work, with what's due next." />

      <dl className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-line [gap:1px] md:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-surface px-5 py-4">
            <dt className="flex items-center gap-2 text-[13px] text-muted">
              <span className={`h-3 w-1 rounded-full ${s.dot}`} aria-hidden="true" />
              {s.label}
            </dt>
            <dd className={`num mt-1 text-xl font-semibold tracking-tight ${s.alert ? "text-red" : ""}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div
        role="group"
        aria-label="Filter by status"
        className="scrollbar-none mb-4 flex w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 sm:w-fit"
      >
        {filters.map((f) => {
          const count = f === "All" ? projects.length : projects.filter((p) => p.status === f).length;
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={`flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors ${
                active ? "bg-raised text-ink ring-1 ring-strong" : "text-muted hover:text-ink"
              }`}
            >
              {f}
              <span
                className={`num rounded px-1.5 text-[11px] ${active ? "bg-accent-soft text-accent" : "bg-raised text-faint"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table — tablet and up */}
      {visible.length > 0 && (
        <div className="card hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs text-faint">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Project</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Progress</th>
                <th scope="col" className="px-4 py-3 font-medium">Deadline</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-raised">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={p.client} />
                      <div className="min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="mt-0.5 text-xs text-faint">{p.client}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="hidden w-48 px-4 py-4 lg:table-cell">
                    <ProgressBar value={p.progress} status={p.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Deadline project={p} />
                  </td>
                  <td className="num px-6 py-4 text-right font-medium">{currency(p.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards — mobile */}
      <ul className="space-y-3 md:hidden">
        {visible.map((p) => (
          <li key={p.id} className="card p-4">
            <div className="flex items-start gap-3">
              <ClientAvatar name={p.client} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="mt-0.5 text-xs text-faint">{p.client}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-4">
              <ProgressBar value={p.progress} status={p.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[13px]">
              <Deadline project={p} stacked={false} />
              <span className="num font-medium">{currency(p.budget)}</span>
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No projects with this status</p>
          <p className="mt-1 text-sm text-muted">Pick another filter to see more of your work.</p>
          <button type="button" className="btn-secondary mt-5" onClick={() => setFilter("All")}>
            Show all projects
          </button>
        </div>
      )}
    </>
  );
}
