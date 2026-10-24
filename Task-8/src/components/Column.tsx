import { useDroppable } from "@dnd-kit/core";
import type { Column as ColumnData, Status } from "../types/job";
import { JobCard } from "./JobCard";
import { STATUS_DOT } from "./StatsBar";

const EMPTY_COPY: Readonly<Record<Status, string>> = {
  applied: "New applications land here.",
  interviewing: "Nothing in conversation yet.",
  offer: "Your first offer will show up here.",
  rejected: "No rejections. Keep going.",
};

export interface ColumnProps {
  column: ColumnData;
  onOpen: (jobId: string) => void;
}

export function Column({ column, onOpen }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      aria-labelledby={`column-${column.id}-heading`}
      className={`flex min-h-[240px] w-[84%] shrink-0 snap-center flex-col rounded-card sm:w-[46%] lg:w-auto lg:shrink border p-2.5 transition-colors duration-150 ${
        isOver ? "border-accent/50 bg-info-bg/60" : "border-border/80 bg-raised/70"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between px-1.5 pt-1">
        <h2
          id={`column-${column.id}-heading`}
          className="flex items-center gap-2 font-display text-[14px] font-semibold text-ink"
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATUS_DOT[column.id]}`} />
          {column.title}
        </h2>
        <span className="num rounded-chip bg-surface px-2 py-0.5 text-[11px] font-medium text-muted shadow-card">
          {column.jobs.length}
        </span>
      </div>

      <ul
        ref={setNodeRef}
        data-testid={`column-${column.id}`}
        className="m-0 flex min-h-[140px] flex-1 list-none flex-col gap-2.5 p-0"
      >
        {column.jobs.length === 0 ? (
          <li className="flex flex-1 list-none items-center justify-center rounded-card border border-dashed border-faint/40 p-4 text-center text-[12.5px] text-faint">
            {EMPTY_COPY[column.id]}
          </li>
        ) : (
          column.jobs.map((job) => <JobCard key={job.id} job={job} onOpen={onOpen} />)
        )}
      </ul>
    </section>
  );
}
