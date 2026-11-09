import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { NewJobInput } from "../types/job";
import { useDialog } from "../hooks/useDialog";
import { CloseIcon } from "./Icons";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const INPUT_CLASS =
  "w-full rounded-control border border-border bg-ground/60 px-3 py-2 text-sm text-ink placeholder:text-faint/70 focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const EMPTY_FORM = (): NewJobInput => ({
  company: "",
  role: "",
  status: "applied",
  appliedDate: today(),
  location: "",
  salary: "",
  contactName: "",
  contactEmail: "",
  url: "",
  notes: "",
});

export interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: NewJobInput) => void;
}

export function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<NewJobInput>({
    defaultValues: EMPTY_FORM(),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(EMPTY_FORM());
    firstFieldRef.current?.focus();
  }, [isOpen, reset]);

  useDialog(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  const submit = (values: NewJobInput): void => {
    onSubmit(values);
    onClose();
  };

  const onInvalid = (): void => {
    const [firstErrorField] = Object.keys(errors);
    if (firstErrorField) setFocus(firstErrorField as keyof NewJobInput);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-job-title"
        className="w-full max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="add-job-title" className="font-display text-lg font-semibold text-ink">
              Add a job application
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">Log it now and move it along as it progresses.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-control p-1 text-muted transition-colors hover:bg-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit, onInvalid)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="company"
              label="Company"
              error={errors.company?.message}
              inputProps={register("company", { required: "Enter the company name." })}
              onRefCapture={(node) => {
                firstFieldRef.current = node;
              }}
              placeholder="e.g. Acme Corp…"
              autoComplete="organization"
            />
            <Field
              id="role"
              label="Role"
              error={errors.role?.message}
              inputProps={register("role", { required: "Enter the role you applied for." })}
              placeholder="e.g. Frontend Engineer…"
              autoComplete="off"
            />
            <Field
              id="appliedDate"
              label="Applied on"
              type="date"
              error={errors.appliedDate?.message}
              inputProps={register("appliedDate", { required: "Choose the date you applied." })}
              autoComplete="off"
            />
            <Field
              id="location"
              label="Location"
              error={errors.location?.message}
              inputProps={register("location")}
              placeholder="e.g. Remote…"
              autoComplete="address-level2"
            />
            <Field
              id="salary"
              label="Salary"
              error={errors.salary?.message}
              inputProps={register("salary")}
              placeholder="e.g. $120k - $140k…"
              autoComplete="off"
            />
            <Field
              id="url"
              label="Listing URL"
              wide
              type="url"
              error={errors.url?.message}
              inputProps={register("url")}
              placeholder="e.g. https://…"
              autoComplete="url"
            />
            <Field
              id="contactName"
              label="Contact name"
              error={errors.contactName?.message}
              inputProps={register("contactName")}
              placeholder="e.g. Jordan Lee…"
              autoComplete="off"
            />
            <Field
              id="contactEmail"
              label="Contact email"
              type="email"
              error={errors.contactEmail?.message}
              inputProps={register("contactEmail")}
              placeholder="e.g. jordan@acme.com…"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-ink">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="e.g. referred by…"
                className={INPUT_CLASS}
                {...register("notes")}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-control border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              {isSubmitting ? "Adding…" : "Add job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  id: keyof NewJobInput;
  label: string;
  error: string | undefined;
  inputProps: ReturnType<ReturnType<typeof useForm<NewJobInput>>["register"]>;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  spellCheck?: boolean;
  wide?: boolean;
  onRefCapture?: (node: HTMLInputElement | null) => void;
}

function Field({ id, label, error, inputProps, type = "text", placeholder, autoComplete, spellCheck, wide, onRefCapture }: FieldProps) {
  const { ref: registerRef, ...rest } = inputProps;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={INPUT_CLASS}
        ref={(node) => {
          registerRef(node);
          onRefCapture?.(node);
        }}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[12px] text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
}
