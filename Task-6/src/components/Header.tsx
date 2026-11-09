import { CalendarDays, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NotificationMenu from "./NotificationMenu";
import { initials } from "../data/mock";
import { useProfile } from "../store/profile";

interface Props {
  onMenuClick: () => void;
}

const titles: Record<string, string> = {
  "/": "Overview",
  "/projects": "Projects",
  "/settings": "Profile settings",
};

const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function Header({ onMenuClick }: Props) {
  const { pathname } = useLocation();
  const section = titles[pathname] ?? "Not found";
  const { name, role } = useProfile();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          className="icon-btn -ml-2 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
          aria-controls="sidebar"
        >
          <Menu size={20} />
        </button>

        <p className="flex items-center gap-2 text-sm">
          <span className="hidden text-faint sm:inline">Taskly</span>
          <span className="hidden text-strong sm:inline" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-ink">{section}</span>
        </p>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="mr-2 hidden h-9 items-center gap-2 rounded-lg border border-line px-3 text-[13px] text-muted md:inline-flex">
            <CalendarDays size={15} strokeWidth={1.75} aria-hidden="true" />
            {today}
          </span>
          <NotificationMenu />
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
          <Link
            to="/settings"
            aria-label="Profile settings"
            className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-raised sm:pr-3"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-xs font-semibold text-accent">
              {initials(name)}
            </span>
            <span className="hidden max-w-40 text-left leading-tight sm:block [&>span]:truncate">
              <span className="block text-[13px] font-medium text-ink">{name}</span>
              <span className="block text-xs text-faint">{role}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
