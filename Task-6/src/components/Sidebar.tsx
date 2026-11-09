import { NavLink } from "react-router-dom";
import { FolderKanban, LayoutGrid, UserRound, X } from "lucide-react";
import { projects } from "../data/mock";

const links = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban, end: false },
  { to: "/settings", label: "Profile Settings", icon: UserRound, end: false },
];

const activeCount = projects.filter((p) => p.status === "In progress" || p.status === "In review").length;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/70 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-200 ease-out lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-canvas">
              <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
                <path
                  d="M9 9h14M16 9v15"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <p className="text-lg font-semibold tracking-tight">Taskly</p>
          </div>
          <button type="button" className="icon-btn lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 pt-6">
          <p className="mb-2 px-3 text-xs font-medium text-faint">Workspace</p>
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-raised text-ink" : "text-muted hover:bg-raised hover:text-ink"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-3 top-2 h-6 w-[3px] rounded-r-full bg-accent" aria-hidden="true" />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        className={isActive ? "text-accent" : "text-faint transition-colors group-hover:text-muted"}
                        aria-hidden="true"
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="m-3 rounded-xl border border-line bg-canvas p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-green" />
            </span>
            Available for work
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {activeCount} active projects. Booking new work from mid-December.
          </p>
        </div>
      </aside>
    </>
  );
}
