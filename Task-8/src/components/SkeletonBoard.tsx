import { STATUSES, STATUS_LABEL } from "../types/job";

/**
 * Mirrors the loaded board's exact geometry (same column widths, same card pitch) with
 * flat grey bars standing in for real values — no shimmer, no layout shift on load.
 */
export function SkeletonBoard() {
  return (
    <div
      className="-mx-4 flex items-start gap-3 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:px-0"
      aria-hidden="true"
      data-testid="skeleton-board"
    >
      {STATUSES.map((status, columnIndex) => (
        <div key={status} className="w-[84%] shrink-0 rounded-card sm:w-[46%] lg:w-auto border border-border/80 bg-raised/70 p-2.5">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="h-4 w-20 rounded bg-border" />
            <span className="h-4 w-6 rounded bg-border" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: columnIndex === 0 ? 3 : 2 }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3.5"
              >
                <span className="h-9 w-full rounded-[10px] bg-rule" />
                <span className="h-3 w-5/6 rounded bg-rule" />
                <span className="h-3 w-1/3 rounded bg-rule" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Loading {STATUS_LABEL[STATUSES[0]]} board…</span>
    </div>
  );
}
