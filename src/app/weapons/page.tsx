"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { WeaponCard } from "@/components/weapon-card";
import { EmptyState } from "@/components/empty-state";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import weapons from "../../../data/weapons.json";
import type { Weapon } from "@/lib/types";
import Link from "next/link";

const allWeapons = weapons as Weapon[];

export default function WeaponsPage() {
  const [filters, setFilters] = useState<FilterState>({
    handSlots: [],
    weaponTypes: [],
    vocations: [],
    minTier: 1,
    perkSearch: "",
    selectedPerks: [],
  });
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortBy, setSortBy] = useState<string>("name");

  const filteredWeapons = useMemo(() => {
    let result = allWeapons;

    if (filters.handSlots.length > 0) {
      result = result.filter((w) => filters.handSlots.includes(w.hand));
    }

    if (filters.weaponTypes.length > 0) {
      result = result.filter((w) => filters.weaponTypes.includes(w.type));
    }

    if (filters.vocations.length > 0) {
      result = result.filter((w) =>
        filters.vocations.some((v) => w.vocation.includes(v as never))
      );
    }

    if (filters.perkSearch) {
      const search = filters.perkSearch.toLowerCase();
      result = result.filter((w) =>
        w.perks.some((tier) =>
          tier.perks.some((perk) => perk.toLowerCase().includes(search))
        )
      );
    }

    if (filters.selectedPerks.length > 0) {
      result = result.filter((w) =>
        filters.selectedPerks.every((perkId) => {
          const perk = perkId.toLowerCase();
          return w.perks.some((tier) =>
            tier.perks.some((p) => {
              const pl = p.toLowerCase();
              if (perk === "hit points") return pl.includes("hit points") || pl.includes("life");
              if (perk === "mana points") return pl.includes("mana on") || pl.includes("mana leech");
              if (perk === "spell") return pl.includes("spell") || pl.includes("cooldown") || pl.includes("front sweep") || pl.includes("wave") || pl.includes("strike");
              return pl.includes(perk);
            })
          );
        })
      );
    }

    if (filters.minTier > 1) {
      result = result.filter((w) =>
        w.perks.some((tier) => tier.tier >= filters.minTier)
      );
    }

    result = result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "level":
          return a.level - b.level;
        case "attack":
          return b.attack - a.attack;
        case "tiers":
          return b.perks.length - a.perks.length;
        default:
          return 0;
      }
    });

    return result;
  }, [filters, sortBy]);

  const resetFilters = () => {
    setFilters({
      handSlots: [],
      weaponTypes: [],
      vocations: [],
      minTier: 1,
      perkSearch: "",
      selectedPerks: [],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredWeapons.length}</span>{" "}
                weapons found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="level">Sort by Level</option>
                <option value="attack">Sort by Attack</option>
                <option value="tiers">Sort by Tiers</option>
              </select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "card" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredWeapons.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : viewMode === "card" ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredWeapons.map((weapon, i) => (
                  <WeaponCard key={weapon.id} weapon={weapon} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Name</th>
                    <th className="text-left py-3 px-2 font-medium">Type</th>
                    <th className="text-left py-3 px-2 font-medium">Vocation</th>
                    <th className="text-right py-3 px-2 font-medium">Attack</th>
                    <th className="text-right py-3 px-2 font-medium">Level</th>
                    <th className="text-left py-3 px-2 font-medium">Perks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWeapons.map((weapon) => (
                    <tr
                      key={weapon.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 font-medium">
                        <Link href={`/weapons/${weapon.id}`} className="hover:text-primary">
                          {weapon.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2 capitalize">{weapon.type}</td>
                      <td className="py-3 px-2">
                        {weapon.vocation.map((v) => (
                          <span key={v} className="inline-block bg-muted rounded px-1.5 py-0.5 text-xs mr-1 capitalize">
                            {v}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-2 text-right">{weapon.attack || "-"}</td>
                      <td className="py-3 px-2 text-right">{weapon.level}</td>
                      <td className="py-3 px-2">
                        {weapon.perks.map((t) => (
                          <span key={t.tier} className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded px-1.5 py-0.5 text-xs mr-1">
                            T{t.tier}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
