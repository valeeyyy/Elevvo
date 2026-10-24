import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SAMPLE_JOBS } from "../data/sampleJobs";
import { STATUSES, STATUS_LABEL } from "../types/job";
import type { Column, Job, NewJobInput, Status } from "../types/job";

const STORAGE_KEY = "trekker.jobs.v2";
const SIMULATED_LOAD_DELAY_MS = 1000;

function makeJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseJobsResult {
  /** True while the simulated network delay is in flight; render the skeleton while true. */
  isLoading: boolean;
  columns: readonly Column[];
  addJob: (input: NewJobInput) => void;
  moveJob: (jobId: string, toStatus: Status) => void;
  deleteJob: (jobId: string) => void;
}

export function useJobs(): UseJobsResult {
  const [jobs, setJobs, isLoading] = useLocalStorage<readonly Job[]>(STORAGE_KEY, () => SAMPLE_JOBS, {
    delayMs: SIMULATED_LOAD_DELAY_MS,
  });

  const addJob = (input: NewJobInput): void => {
    const job: Job = { ...input, id: makeJobId() };
    setJobs((previous) => [job, ...previous]);
  };

  const moveJob = (jobId: string, toStatus: Status): void => {
    setJobs((previous) =>
      previous.map((job) => (job.id === jobId ? { ...job, status: toStatus } : job))
    );
  };

  const deleteJob = (jobId: string): void => {
    setJobs((previous) => previous.filter((job) => job.id !== jobId));
  };

  const columns = useMemo<readonly Column[]>(
    () =>
      STATUSES.map((status) => ({
        id: status,
        title: STATUS_LABEL[status],
        jobs: jobs.filter((job) => job.status === status),
      })),
    [jobs]
  );

  return { isLoading, columns, addJob, moveJob, deleteJob };
}
