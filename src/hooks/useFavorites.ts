"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: string[];
  toggleFavorite: (weaponId: string) => void;
  isFavorite: (weaponId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (weaponId) => {
        const { favorites } = get();
        if (favorites.includes(weaponId)) {
          set({ favorites: favorites.filter((id) => id !== weaponId) });
        } else {
          set({ favorites: [...favorites, weaponId] });
        }
      },
      isFavorite: (weaponId) => {
        return get().favorites.includes(weaponId);
      },
    }),
    { name: "tibia-wp-favorites" }
  )
);
