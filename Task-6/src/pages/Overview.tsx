import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import { ArrowUpRight, CircleCheck, Clock, FolderKanban, Wallet, type LucideIcon } from "lucide-react";
import {
  activities,
  currency,
  daysUntil,
  monthlyEarnings,
  projects,
  relativeDeadline,
  shortDate,
  taskTypes,
  tasksDue,
} from "../data/mock";
import { chartColors, chartMuted, palette } from "../lib/palette";
import { firstName, useProfile } from "../store/profile";
import StatusBadge, { ClientAvatar, PageHeader } from "../components/ui";

const thisMonth = monthlyEarnings[monthlyEarnings.length - 1]!;
const lastMonth = monthlyEarnings[monthlyEarnings.length - 2]!;
const change = Math.round(((thisMonth.amount - lastMonth.amount) / lastMonth.amount) * 100);
const activeProjects = projects.filter((p) => p.status === "In progress" || p.status === "In review");
const sixMonthTotal = monthlyEarnings.reduce((sum, m) => sum + m.amount, 0);
const monthlyAverage = Math.round(sixMonthTotal / monthlyEarnings.length);
const pipeline = activeProjects.reduce((sum, p) => sum + p.budget, 0);
const totalTasks = taskTypes.reduce((sum, t) => sum + t.count, 0);
const upcoming = projects
  .filter((p) => p.status !== "Completed")
  .sort((a, b) => a.deadline.localeCompare(b.deadline))
  .slice(0, 4);

interface Stat {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: string;
}

const stats: Stat[] = [
  {
    label: "Total projects",
    value: String(projects.length),
    note: `${activeProjects.length} currently active`,
    icon: FolderKanban,
    tone: "bg-accent-soft text-accent",
  },
  {
    label: "Earnings this month",
    value: currency(thisMonth.amount),
    note: `+${change}% from ${lastMonth.month}`,
    icon: Wallet,
    tone: "bg-teal-soft text-teal",
  },
  {
    label: "Tasks due",
    value: String(tasksDue),
    note: "2 due this week",
    icon: Clock,
    tone: "bg-amber-soft text-amber",
  },
  {
    label: "Active pipeline",
    value: currency(pipeline),
    note: `Across ${activeProjects.length} projects`,
    icon: CircleCheck,
    tone: "bg-pink-soft text-pink",
  },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function ChartTooltip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-strong bg-raised px-3 py-2 text-xs shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]">
      <p className="text-muted">{label}</p>
      <p className="num mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }: Stat) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-snug text-muted">{label}</p>
        <span className={`hidden size-9 shrink-0 place-items-center rounded-lg sm:grid ${tone}`} aria-hidden="true">
          <Icon size={17} strokeWidth={1.9} />
        </span>
      </div>
      <p className="num mt-3 text-[22px] font-semibold leading-none tracking-tight sm:text-[28px]">{value}</p>
      <p className="mt-2.5 text-xs text-faint">{note}</p>
    </div>
  );
}

function EarningsCard() {
  return (
    <section aria-labelledby="earnings-title" className="card flex flex-col lg:col-span-2">
      <div className="card-header flex-wrap">
        <div>
          <h2 id="earnings-title" className="card-title">
            Monthly earnings
          </h2>
          <p className="card-subtitle">May – October 2026</p>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs text-faint">Six-month total</dt>
            <dd className="num mt-0.5 text-lg font-semibold tracking-tight">{currency(sixMonthTotal)}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Monthly average</dt>
            <dd className="num mt-0.5 text-lg font-semibold tracking-tight text-muted">{currency(monthlyAverage)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 min-h-64 flex-1 px-2 pb-4 sm:min-h-72 sm:px-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyEarnings} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={palette.line} strokeDasharray="3 4" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: palette.muted, fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: palette.faint, fontSize: 12 }}
              tickFormatter={(v: number) => `$${v / 1000}k`}
              width={48}
            />
            <Tooltip
              cursor={{ fill: palette.raised, radius: 6 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltip label={`${label} 2026`} value={currency(Number(payload[0]!.value))} />
                ) : null
              }
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48} animationDuration={500}>
              {monthlyEarnings.map((m) => (
                <Cell key={m.month} fill={m === thisMonth ? palette.accent : chartMuted} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 border-t border-line px-5 py-3.5 text-xs text-muted sm:px-6">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-accent" aria-hidden="true" /> This month
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: chartMuted }} aria-hidden="true" /> Earlier
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-green">
          <ArrowUpRight size={14} aria-hidden="true" />
          {change}% vs {lastMonth.month}
        </span>
      </div>
    </section>
  );
}

function TaskMixCard() {
  const [hovered, setHovered] = useState<number | null>(null);
  const focus = hovered === null ? null : taskTypes[hovered]!;

  return (
    <section aria-labelledby="tasks-title" className="card flex flex-col">
      <div className="card-header">
        <div>
          <h2 id="tasks-title" className="card-title">
            Task mix
          </h2>
          <p className="card-subtitle">Tasks logged in October</p>
        </div>
      </div>

      <div className="relative mx-auto mt-2 size-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={taskTypes}
              dataKey="count"
              nameKey="type"
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke={palette.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, i) => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              isAnimationActive={false}
            >
              {taskTypes.map((t, i) => (
                <Cell
                  key={t.type}
                  fill={chartColors[i]}
                  opacity={hovered === null || hovered === i ? 1 : 0.35}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center" aria-hidden="true">
          <p className="num text-[28px] font-semibold leading-none tracking-tight">{focus ? focus.count : totalTasks}</p>
          <p className="mt-1.5 text-xs text-muted">{focus ? focus.type : "Total tasks"}</p>
        </div>
      </div>

      <ul className="mt-auto space-y-1 px-3 pb-4 pt-5 sm:px-4">
        {taskTypes.map((t, i) => (
          <li
            key={t.type}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              hovered === i ? "bg-raised" : ""
            }`}
          >
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: chartColors[i] }} aria-hidden="true" />
            <span className="flex-1 text-muted">{t.type}</span>
            <span className="num font-medium">{t.count}</span>
            <span className="num w-10 text-right text-xs text-faint">{Math.round((t.count / totalTasks) * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityCard() {
  return (
    <section aria-labelledby="activity-title" className="card lg:col-span-2">
      <div className="card-header">
        <div>
          <h2 id="activity-title" className="card-title">
            Recent activity
          </h2>
          <p className="card-subtitle">Updates from your clients and projects</p>
        </div>
        <Link to="/projects" className="link-subtle shrink-0">
          View projects
        </Link>
      </div>
      <ol className="mt-4 px-5 pb-3 sm:px-6">
        {activities.map((a, i) => (
          <li key={a.id} className="relative flex gap-4 pb-5">
            {i < activities.length - 1 && (
              <span className="absolute left-[5px] top-5 h-[calc(100%-12px)] w-px bg-line" aria-hidden="true" />
            )}
            <span
              className={`relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 ${
                i === 0 ? "border-accent bg-accent-soft" : "border-strong bg-surface"
              }`}
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{a.text}</p>
                <p className="mt-0.5 text-[13px] text-muted">{a.detail}</p>
              </div>
              <p className="shrink-0 text-xs text-faint">{a.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DeadlinesCard() {
  return (
    <section aria-labelledby="deadlines-title" className="card">
      <div className="card-header">
        <div>
          <h2 id="deadlines-title" className="card-title">
            Upcoming deadlines
          </h2>
          <p className="card-subtitle">Open projects by due date</p>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-line px-5 pb-2 sm:px-6">
        {upcoming.map((p) => {
          const overdue = daysUntil(p.deadline) < 0;
          return (
            <li key={p.id} className="flex items-center gap-3 py-3.5">
              <ClientAvatar name={p.client} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="num mt-0.5 text-xs text-faint">{shortDate(p.deadline)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={p.status} />
                <span className={`num text-xs ${overdue ? "text-red" : "text-muted"}`}>
                  {relativeDeadline(p.deadline, p.status)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Overview() {
  const name = useProfile((s) => s.name);
  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName(name)}`}
        description="Here's where things stand across your client work."
        action={
          <Link to="/projects" className="btn-secondary">
            <FolderKanban size={16} strokeWidth={1.9} aria-hidden="true" />
            All projects
          </Link>
        }
      />

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <EarningsCard />
        <TaskMixCard />
        <ActivityCard />
        <DeadlinesCard />
      </div>
    </>
  );
}
