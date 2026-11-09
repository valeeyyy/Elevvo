import "@testing-library/jest-dom/vitest";
import { cloneElement, type ReactElement } from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom lacks ResizeObserver (used by Recharts' ResponsiveContainer).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

// jsdom has no layout, so ResponsiveContainer measures 0×0 and Recharts warns.
// Give charts a fixed size in tests instead.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      cloneElement(children, { width: 800, height: 256 } as Record<string, unknown>),
  };
});

// Reset the persisted profile store between tests.
import { useProfile, defaultProfile } from "../store/profile";
afterEach(() => useProfile.setState(defaultProfile));
