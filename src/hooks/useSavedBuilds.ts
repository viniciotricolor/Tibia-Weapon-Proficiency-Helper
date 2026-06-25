"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedBuild {
  id: string;
  name: string;
  weaponId: string;
  selectedPerks: Record<number, string>;
  createdAt: number;
}

interface SavedBuildsStore {
  builds: SavedBuild[];
  saveBuild: (build: Omit<SavedBuild, "id" | "createdAt">) => void;
  deleteBuild: (id: string) => void;
  updateBuild: (id: string, selectedPerks: Record<number, string>) => void;
}

export const useSavedBuildsStore = create<SavedBuildsStore>()(
  persist(
    (set, get) => ({
      builds: [],
      saveBuild: (build) => {
        const newBuild: SavedBuild = {
          ...build,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          createdAt: Date.now(),
        };
        set({ builds: [...get().builds, newBuild] });
      },
      deleteBuild: (id) => {
        set({ builds: get().builds.filter((b) => b.id !== id) });
      },
      updateBuild: (id, selectedPerks) => {
        set({
          builds: get().builds.map((b) =>
            b.id === id ? { ...b, selectedPerks } : b
          ),
        });
      },
    }),
    { name: "tibia-wp-builds" }
  )
);
