import { useMemo, useState } from "react";
import { useJobs } from "./hooks/useJobs";
import { Board } from "./components/Board";
import { SkeletonBoard } from "./components/SkeletonBoard";
import { AddJobModal } from "./components/AddJobModal";
import { JobDetailsModal } from "./components/JobDetailsModal";
import { StatsBar } from "./components/StatsBar";
import { PlusIcon, TrekkerMark, SearchIcon } from "./components/Icons";

export default function App() {
  const { isLoading, columns, addJob, moveJob, deleteJob } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedJob = useMemo(
    () => columns.flatMap((column) => column.jobs).find((job) => job.id === selectedId) ?? null,
    [columns, selectedId]
  );

  const visibleColumns = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return columns;
    return columns.map((column) => ({
      ...column,
      jobs: column.jobs.filter((job) => `${job.company} ${job.role} ${job.location}`.toLowerCase().includes(needle)),
    }));
  }, [columns, query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(79,109,245,0.22),transparent_70%),linear-gradient(180deg,#0e1626_0%,#0a1020_55%,#070b18_100%)] bg-fixed">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border bg-ground/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5" aria-label="Trekker">
            <TrekkerMark />
            <span className="font-display text-[17px] font-bold tracking-tight text-ink">Trekker</span>
          </div>

          <div className="relative ml-auto hidden w-full max-w-xs sm:block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="search"
              name="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, role or city…"
              aria-label="Search applications"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-control border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink shadow-card placeholder:text-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-sm font-medium text-surface shadow-card transition-colors hover:bg-primary-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground sm:ml-0"
          >
            <PlusIcon />
            Add job
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 sm:hidden">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            name="search-mobile"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, role or city…"
            aria-label="Search applications"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-control border border-border bg-surface py-2.5 pl-9 pr-3 text-base text-ink shadow-card placeholder:text-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1240px] px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="font-display text-[26px] font-semibold sm:text-[32px] tracking-tight text-ink [text-wrap:balance]">
            Every step gets you closer to the summit.
          </h1>
          <p className="mt-1 text-sm text-muted">Map your climb from first application to signed offer, and keep every interview, follow-up and win within reach.</p>
        </div>

        <StatsBar columns={columns} isLoading={isLoading} />

        <div aria-live="polite">
          {isLoading ? <SkeletonBoard /> : <Board columns={visibleColumns} onMove={moveJob} onOpen={setSelectedId} />}
        </div>
      </main>

      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedId(null)}
        onDelete={(jobId) => {
          deleteJob(jobId);
          setSelectedId(null);
        }}
      />
      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addJob} />
    </div>
  );
}
