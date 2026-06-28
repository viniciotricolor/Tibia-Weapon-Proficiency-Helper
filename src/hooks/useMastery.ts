import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeaponMastery } from "@/types/mastery";
import { allMasteries } from "@/data/masteries";

interface MasteryStore {
  masteries: WeaponMastery[];
  selectedWeaponId: string;

  getSelectedMastery: () => WeaponMastery | undefined;
  selectWeapon: (weaponId: string) => void;
  selectPerk: (tier: number, perkId: string) => void;
  resetWeapon: () => void;
}

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      masteries: allMasteries,
      selectedWeaponId: "cobra-rod",

      getSelectedMastery: () => {
        const state = get();
        return state.masteries.find((m) => m.id === state.selectedWeaponId);
      },

      selectWeapon: (weaponId) => set({ selectedWeaponId: weaponId }),

      selectPerk: (tier, perkId) => {
        set((state) => {
          const masteries = state.masteries.map((m) => {
            if (m.id !== state.selectedWeaponId) return m;
            return {
              ...m,
              selectedPerks: {
                ...m.selectedPerks,
                [tier]: perkId,
              },
            };
          });
          return { masteries };
        });
      },

      resetWeapon: () => {
        set((state) => {
          const masteries = state.masteries.map((m) => {
            if (m.id !== state.selectedWeaponId) return m;
            return {
              ...m,
              selectedPerks: {},
            };
          });
          return { masteries };
        });
      },
    }),
    {
      name: "tibia-wp-mastery",
      // Only persist user progress, not the full masteries data (which is
      // regenerated from weapons.json on every load)
      partialize: (state) => ({
        selectedWeaponId: state.selectedWeaponId,
        selectedPerksMap: state.masteries.reduce(
          (acc, m) => {
            if (Object.keys(m.selectedPerks).length > 0) {
              acc[m.id] = m.selectedPerks;
            }
            return acc;
          },
          {} as Record<string, Record<number, string>>,
        ),
      }),
      merge: (persisted, current) => {
        const saved = persisted as {
          selectedWeaponId?: string;
          selectedPerksMap?: Record<string, Record<number, string>>;
        } | undefined;
        // Start with freshly generated masteries
        const masteries = allMasteries.map((m) => {
          // Restore saved perks if available
          const savedPerks = saved?.selectedPerksMap?.[m.id];
          return savedPerks ? { ...m, selectedPerks: savedPerks } : m;
        });
        return {
          ...current,
          masteries,
          selectedWeaponId: saved?.selectedWeaponId ?? current.selectedWeaponId,
        };
      },
    },
  ),
);
