import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CircleCheck, KeyRound, Mail, Pencil, UserRound, BriefcaseBusiness } from "lucide-react";
import { PageHeader } from "../components/ui";
import { initials } from "../data/mock";
import { useProfile, type Profile } from "../store/profile";

function Section({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="card-title">{title}</h2>
          <p className="card-subtitle">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SavedNote({ show, text }: { show: boolean; text: string }) {
  return (
    <p aria-live="polite" className="mr-auto flex items-center gap-2 text-sm font-medium text-green">
      {show && (
        <>
          <CircleCheck size={16} aria-hidden="true" />
          {text}
        </>
      )}
    </p>
  );
}

const fields: { key: keyof Profile; label: string; type: string; autoComplete: string; icon: typeof Mail }[] = [
  { key: "name", label: "Full name", type: "text", autoComplete: "name", icon: UserRound },
  { key: "email", label: "Email", type: "email", autoComplete: "email", icon: Mail },
  { key: "role", label: "Role", type: "text", autoComplete: "organization-title", icon: BriefcaseBusiness },
];

function useFlash() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(false), 2500);
    return () => window.clearTimeout(t);
  }, [on]);
  return [on, () => setOn(true)] as const;
}

export default function Settings() {
  const { name, email, role, update } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>({ name, email, role });
  const [profileError, setProfileError] = useState("");
  const [profileSaved, flashProfileSaved] = useFlash();

  const [pwError, setPwError] = useState("");
  const [pwSaved, flashPwSaved] = useFlash();

  // While editing, the profile card previews the draft; otherwise it shows saved data.
  const shown = editing ? draft : { name, email, role };

  function startEditing() {
    setDraft({ name, email, role });
    setProfileError("");
    setEditing(true);
  }

  function cancelEditing() {
    setProfileError("");
    setEditing(false);
  }

  function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = { name: draft.name.trim(), email: draft.email.trim(), role: draft.role.trim() };
    if (!next.name) return setProfileError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(next.email)) return setProfileError("Enter a valid email address.");
    update(next);
    setProfileError("");
    setEditing(false);
    flashProfileSaved();
  }

  function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 8) return setPwError("Password must be at least 8 characters.");
    if (password !== confirm) return setPwError("Passwords don't match.");

    setPwError("");
    form.reset();
    flashPwSaved();
  }

  return (
    <>
      <PageHeader title="Profile settings" description="Update how clients see you and how you sign in." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit overflow-hidden" aria-label="Profile preview">
          <div className="relative h-20 overflow-hidden bg-accent-soft" aria-hidden="true">
            <span className="absolute -right-6 -top-10 size-28 rounded-full bg-[#2f2856]" />
            <span className="absolute right-16 top-8 size-14 rounded-full bg-[#2b2350]" />
          </div>
          <div className="relative -mt-10 px-6 pb-6">
            <span className="grid size-20 place-items-center rounded-2xl border-4 border-surface bg-accent text-2xl font-semibold text-canvas">
              {initials(shown.name) || "?"}
            </span>
            <p className="mt-4 break-words text-lg font-semibold tracking-tight">{shown.name || "Your name"}</p>
            <p className="text-sm text-muted">{shown.role || "Your role"}</p>
            <p className="mt-1 break-all text-sm text-faint">{shown.email}</p>
            {editing && (
              <p className="mt-3 inline-flex rounded-md bg-amber-soft px-2 py-1 text-xs font-medium text-amber">
                Previewing unsaved changes
              </p>
            )}
            <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Member since</dt>
                <dd className="font-medium">Mar 2024</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Projects delivered</dt>
                <dd className="num font-medium">24</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Status</dt>
                <dd className="flex items-center gap-1.5 font-medium text-green">
                  <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
                  Available
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="space-y-6">
          <form onSubmit={saveProfile} noValidate>
            <Section
              icon={<UserRound size={17} strokeWidth={1.9} />}
              title="Profile"
              description="Shown on invoices and shared project pages."
              action={
                !editing && (
                  <button type="button" className="btn-secondary h-9" onClick={startEditing}>
                    <Pencil size={15} strokeWidth={1.9} aria-hidden="true" />
                    Edit profile
                  </button>
                )
              }
            >
              {editing ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {fields.map((f) => (
                      <div key={f.key} className={f.key === "role" ? "sm:col-span-2" : ""}>
                        <label htmlFor={f.key} className="label">
                          {f.label}
                        </label>
                        <input
                          id={f.key}
                          name={f.key}
                          type={f.type}
                          className="input"
                          autoComplete={f.autoComplete}
                          value={draft[f.key]}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                          autoFocus={f.key === "name"}
                        />
                      </div>
                    ))}
                  </div>
                  {profileError && (
                    <p role="alert" className="mt-5 rounded-lg bg-red-soft px-3.5 py-2.5 text-sm text-red">
                      {profileError}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                    <button type="button" className="btn-secondary" onClick={cancelEditing}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <dl className="grid gap-5 sm:grid-cols-3">
                    {fields.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-[13px] text-muted">
                          <Icon size={14} strokeWidth={1.9} aria-hidden="true" />
                          {label}
                        </dt>
                        <dd className="mt-1 truncate text-[15px] font-medium">{shown[key]}</dd>
                      </div>
                    ))}
                  </dl>
                  {profileSaved && (
                    <div className="mt-5 flex">
                      <SavedNote show text="Profile updated" />
                    </div>
                  )}
                </>
              )}
            </Section>
          </form>

          <form onSubmit={savePassword} noValidate>
            <Section
              icon={<KeyRound size={17} strokeWidth={1.9} />}
              title="Password"
              description="Use at least 8 characters."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="label">New password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={!!pwError}
                    aria-describedby={pwError ? "password-error" : undefined}
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="label">Confirm password</label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={!!pwError}
                  />
                </div>
              </div>
              {pwError && (
                <p id="password-error" role="alert" className="mt-5 rounded-lg bg-red-soft px-3.5 py-2.5 text-sm text-red">
                  {pwError}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                <SavedNote show={pwSaved} text="Password updated" />
                <button type="submit" className="btn-primary">
                  Update password
                </button>
              </div>
            </Section>
          </form>
        </div>
      </div>
    </>
  );
}
