import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Job } from "../types/job";
import { Avatar } from "./Avatar";
import { CalendarIcon, ExternalLinkIcon, PinIcon } from "./Icons";

function formatAppliedDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export interface JobCardProps {
  job: Job;
  /** Rendered inside the drag overlay: lifted and slightly tilted, not a live draggable. */
  overlay?: boolean;
  onOpen?: (jobId: string) => void;
}

export function JobCard({ job, overlay = false, onOpen }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: { status: job.status },
  });

  const style = transform && !overlay ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen?.(job.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target === event.currentTarget) {
          event.preventDefault();
          onOpen?.(job.id);
          return;
        }
        listeners?.onKeyDown?.(event);
      }}
      data-testid="job-card"
      data-job-id={job.id}
      aria-label={`${job.role} at ${job.company}`}
      className={`group relative cursor-grab list-none rounded-card border border-border bg-surface p-3.5 text-left shadow-card transition-[box-shadow,transform,border-color] duration-150 hover:border-[#3a4a68] hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing ${
        isDragging && !overlay ? "z-10 opacity-40" : ""
      } ${overlay ? "rotate-[1.5deg] cursor-grabbing shadow-lift" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={job.company} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-snug text-ink [text-wrap:balance]">{job.role}</p>
          <p className="mt-0.5 truncate text-[13px] text-muted">{job.company}</p>
        </div>
        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(event) => event.stopPropagation()}
            className="-m-1 shrink-0 rounded-md p-1 text-faint opacity-60 transition hover:bg-raised hover:text-ink hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
            aria-label={`Open the ${job.role} listing at ${job.company} in a new tab`}
          >
            <ExternalLinkIcon />
          </a>
        ) : null}
      </div>

      {job.notes ? (
        <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{job.notes}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-rule pt-3 text-[12px] text-faint">
        <span className="num inline-flex items-center gap-1.5">
          <CalendarIcon width={13} height={13} />
          {formatAppliedDate(job.appliedDate)}
        </span>
        {job.location ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <PinIcon width={13} height={13} />
            <span className="truncate">{job.location}</span>
          </span>
        ) : null}
        {job.salary ? (
          <span className="num ml-auto rounded-chip bg-raised px-2 py-0.5 font-medium text-muted">{job.salary}</span>
        ) : null}
      </div>
    </li>
  );
}
