import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, CircleDollarSign, MessageSquare, ThumbsUp } from "lucide-react";
import { notifications } from "../data/mock";

// Icon per mock activity, so each notification reads at a glance.
const icons = [
  { icon: ThumbsUp, tone: "bg-green-soft text-green" },
  { icon: CircleDollarSign, tone: "bg-teal-soft text-teal" },
  { icon: MessageSquare, tone: "bg-pink-soft text-pink" },
];

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={`icon-btn ${open ? "bg-raised text-ink" : ""}`}
        aria-label={unread ? `Notifications, ${notifications.length} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={19} strokeWidth={1.75} />
        {unread && (
          <span
            className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-canvas"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <section
          id="notification-panel"
          role="region"
          aria-label="Recent notifications"
          className="fixed inset-x-4 top-[68px] z-30 origin-top-right animate-menu-in overflow-hidden rounded-xl border border-strong bg-raised shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[22rem]"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unread && (
                <span className="num rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent">
                  {notifications.length} new
                </span>
              )}
            </div>
            {unread && (
              <button
                type="button"
                onClick={() => setUnread(false)}
                className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <CheckCheck size={14} aria-hidden="true" />
                Mark all as read
              </button>
            )}
          </div>
          <ul aria-label="Most recent activities" className="p-1.5">
            {notifications.map((n, i) => {
              const { icon: Icon, tone } = icons[i % icons.length]!;
              return (
                <li key={n.id} className="flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-hover">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`} aria-hidden="true">
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug ${unread ? "text-ink" : "text-muted"}`}>{n.text}</p>
                    <p className="mt-1 flex justify-between gap-2 text-xs text-faint">
                      <span className="truncate">{n.detail}</span>
                      <span className="shrink-0">{n.time}</span>
                    </p>
                  </div>
                  {unread && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
