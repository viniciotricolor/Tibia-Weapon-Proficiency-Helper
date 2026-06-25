"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Grid3X3, List, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { WeaponCard } from "@/components/weapon-card";
import { EmptyState } from "@/components/empty-state";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/components/i18n-provider";
import { useFilterURL } from "@/lib/use-filter-url";
import weapons from "../../../data/weapons.json";
import type { Weapon } from "@/lib/types";
import Link from "next/link";

const allWeapons = weapons as Weapon[];
const ITEMS_PER_PAGE = 36;

export default function WeaponsPage() {
  const { t } = useI18n();
  const { filters, setFilters } = useFilterURL();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState(1);

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

    if (filters.families.length > 0) {
      result = result.filter((w) => {
        const nameLower = w.name.toLowerCase();
        return filters.families.some((f) => nameLower.includes(f));
      });
    }

    if (filters.sources.length > 0) {
      result = result.filter((w) => {
        const sourceLower = w.source.toLowerCase();
        return filters.sources.some((s) => sourceLower.includes(s));
      });
    }

    if (filters.elements && filters.elements.length > 0) {
      result = result.filter((w) => {
        const elem = (w.attackElement || "").toLowerCase();
        return filters.elements.some((e) => elem.includes(e));
      });
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

  const totalPages = Math.ceil(filteredWeapons.length / ITEMS_PER_PAGE);
  const paginatedWeapons = filteredWeapons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const resetFilters = () => {
    setFilters({
      handSlots: [],
      weaponTypes: [],
      vocations: [],
      families: [],
      sources: [],
      elements: [],
      minTier: 1,
      perkSearch: "",
      selectedPerks: [],
    });
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    const types = new Map<string, number>();
    const families = new Set<string>();
    let totalTiers = 0;
    allWeapons.forEach((w) => {
      types.set(w.type, (types.get(w.type) || 0) + 1);
      totalTiers += w.perks.length;
      const nameLower = w.name.toLowerCase();
      ["falcon", "cobra", "lion", "naga", "amber", "eldritch", "sanguine", "crypt", "soul", "moonsilver", "inferniarch", "umbral"].forEach((f) => {
        if (nameLower.includes(f)) families.add(f);
      });
    });
    return {
      total: allWeapons.length,
      withPerks: allWeapons.filter((w) => w.perks.length > 0).length,
      avgTiers: (totalTiers / allWeapons.length).toFixed(1),
      families: families.size,
      types: Array.from(types.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="py-3">
          <CardContent className="flex items-center gap-2 px-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{t.stats.totalWeapons}</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-2 px-4">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">{t.stats.withPerks}</p>
              <p className="text-lg font-bold">{stats.withPerks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-2 px-4">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">{t.stats.avgTiers}</p>
              <p className="text-lg font-bold">{stats.avgTiers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className="flex items-center gap-2 px-4">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">{t.stats.families}</p>
              <p className="text-lg font-bold">{stats.families}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    {t.filters.title}
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
                {t.weapons.found}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                <option value="name">{t.weapons.sortBy.name}</option>
                <option value="level">{t.weapons.sortBy.level}</option>
                <option value="attack">{t.weapons.sortBy.attack}</option>
                <option value="tiers">{t.weapons.sortBy.tiers}</option>
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
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {paginatedWeapons.map((weapon, i) => (
                    <WeaponCard key={weapon.id} weapon={weapon} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageLabel={t.weapons.page}
                ofLabel={t.weapons.of}
              />
            </>
          ) : (
            <>
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
                    {paginatedWeapons.map((weapon) => (
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageLabel={t.weapons.page}
                ofLabel={t.weapons.of}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageLabel?: string;
  ofLabel?: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
