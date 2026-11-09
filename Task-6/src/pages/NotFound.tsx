import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="card mx-auto mt-8 max-w-md px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-raised text-muted" aria-hidden="true">
        <Compass size={22} strokeWidth={1.75} />
      </span>
      <p className="num mt-5 text-sm font-medium text-accent">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That page doesn't exist or was moved.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to overview
      </Link>
    </div>
  );
}
