/** The four stages a job application moves through. Order matters: it is the column order. */
export const STATUSES = ["applied", "interviewing", "offer", "rejected"] as const;

export type Status = (typeof STATUSES)[number];

export interface Job {
  id: string;
  company: string;
  role: string;
  status: Status;
  /** ISO date string (yyyy-mm-dd), the day the application was submitted. */
  appliedDate: string;
  location: string;
  url: string;
  notes: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
}

/** Fields the Add Job form collects; `id` is assigned by the board. */
export type NewJobInput = Omit<Job, "id">;

export interface Column {
  id: Status;
  title: string;
  jobs: Job[];
}

export const STATUS_LABEL: Readonly<Record<Status, string>> = {
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};
