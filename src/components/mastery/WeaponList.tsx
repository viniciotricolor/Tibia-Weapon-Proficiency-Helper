"use client";

import { useState } from "react";
import { Search, Star, X, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMasteryStore } from "@/hooks/useMastery";
import { useFavoritesStore } from "@/hooks/useFavorites";
import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";

const allWeapons = weapons as Weapon[];

export default function WeaponList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { selectedWeaponId, selectWeapon, masteries } = useMasteryStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  let filtered = allWeapons.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showFavoritesOnly) {
    filtered = filtered.filter((w) => isFavorite(w.id));
  }

  const getMasteryLevel = (weaponId: string) => {
    const m = masteries.find((m) => m.id === weaponId);
    return m?.level ?? 0;
  };

  const selectedWeapon = allWeapons.find((w) => w.id === selectedWeaponId);

  return (
    <Card className="rounded-r-none border-r-0">
      <CardContent className="p-3">
        {/* Weapon Info */}
        {selectedWeapon && (
          <div className="flex flex-col items-center mb-3">
            <div className="w-16 h-16 flex items-center justify-center mb-2 bg-secondary border border-border rounded-lg relative">
              <img
                src={selectedWeapon.image}
                alt={selectedWeapon.name}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <button
                onClick={() => toggleFavorite(selectedWeapon.id)}
                className="absolute -top-1 -right-1"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(selectedWeapon.id)
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>
            <p className="text-foreground text-sm font-bold text-center">
              {selectedWeapon.name}
            </p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4"
                  style={{
                    fill: s <= getMasteryLevel(selectedWeaponId) ? "#f59e0b" : "hsl(var(--muted))",
                    color: s <= getMasteryLevel(selectedWeaponId) ? "#f59e0b" : "hsl(var(--muted))",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Type to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
              !showFavoritesOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground border-border"
            }`}
          >
            All ({allWeapons.length})
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1 ${
              showFavoritesOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground border-border"
            }`}
          >
            <Heart className="w-3 h-3" /> Favorites
          </button>
        </div>

        {/* Weapon Grid */}
        <ScrollArea className="h-[350px]">
          <div className="grid grid-cols-5 gap-1">
            {filtered.map((weapon) => {
              const hasMastery = masteries.some((m) => m.id === weapon.id);
              const fav = isFavorite(weapon.id);
              return (
                <button
                  key={weapon.id}
                  onClick={() => selectWeapon(weapon.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded border-2 transition-colors relative ${
                    selectedWeaponId === weapon.id
                      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500"
                      : hasMastery
                      ? "bg-secondary border-border hover:border-muted-foreground"
                      : "bg-secondary/50 border-border/50 opacity-50"
                  }`}
                >
                  <img
                    src={weapon.image}
                    alt={weapon.name}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {fav && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
