import { useEffect, useRef } from "react";
import { STATUS_LABEL } from "../types/job";
import type { Job } from "../types/job";
import { useDialog } from "../hooks/useDialog";
import { Avatar } from "./Avatar";
import { CloseIcon } from "./Icons";
import { STATUS_DOT } from "./StatsBar";

function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
  onDelete: (jobId: string) => void;
}

export function JobDetailsModal({ job, onClose, onDelete }: JobDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = job !== null;

  useDialog(isOpen, onClose, dialogRef);
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  if (!job) return null;

  const rows: readonly { label: string; value: string | null; href?: string }[] = [
    { label: "Applied on", value: formatLongDate(job.appliedDate) },
    { label: "Location", value: job.location || null },
    { label: "Salary", value: job.salary?.replace(/\s*[–—]\s*/g, " - ") || null },
    { label: "Contact", value: job.contactName || null },
    { label: "Email", value: job.contactEmail || null, href: job.contactEmail ? `mailto:${job.contactEmail}` : undefined },
    { label: "Listing", value: job.url || null, href: job.url || undefined },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
        className="max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-t-[20px] border border-border bg-surface p-5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] sm:rounded-card sm:p-6"
      >
        <div className="flex items-start gap-3">
          <Avatar name={job.company} />
          <div className="min-w-0 flex-1">
            <h2 id="job-details-title" className="font-display text-lg font-semibold leading-snug text-ink [text-wrap:balance]">
              {job.role}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">{job.company}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 rounded-control p-2 text-muted transition-colors hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 rounded-chip bg-raised px-3 py-1 text-[12px] font-medium text-ink">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATUS_DOT[job.status]}`} />
          {STATUS_LABEL[job.status]}
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-[12px] font-medium text-faint">{row.label}</dt>
              <dd className="mt-0.5 truncate text-sm text-ink">
                {row.value === null ? (
                  <span className="text-faint">–</span>
                ) : row.href ? (
                  <a
                    href={row.href}
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <p className="text-[12px] font-medium text-faint">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {job.notes || "No notes added yet."}
          </p>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <button
            type="button"
            onClick={() => onDelete(job.id)}
            className="rounded-control bg-negative-bg px-4 py-2 text-sm font-medium text-negative transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-negative"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
