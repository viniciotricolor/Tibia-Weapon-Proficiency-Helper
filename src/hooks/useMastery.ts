import { create } from "zustand";
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

export const useMasteryStore = create<MasteryStore>((set, get) => ({
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
}));
