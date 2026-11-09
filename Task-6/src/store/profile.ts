import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  name: string;
  email: string;
  role: string;
}

export const defaultProfile: Profile = {
  name: "Marsha Valerie",
  email: "marsha@taskly.app",
  role: "Product designer",
};

interface ProfileState extends Profile {
  update: (changes: Partial<Profile>) => void;
}

/** Profile shown across the app (header, greeting, settings). Persisted to localStorage. */
export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      ...defaultProfile,
      update: (changes) => set(changes),
    }),
    { name: "taskly-profile" },
  ),
);

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";
