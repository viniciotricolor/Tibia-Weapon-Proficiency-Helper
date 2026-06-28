"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react";
import { Filter, Grid3X3, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { WeaponCard } from "@/components/weapon-card";
import { EmptyState } from "@/components/empty-state";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/components/i18n-provider";
import { useFilterURL } from "@/lib/use-filter-url";
import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";
import Link from "next/link";
import { List as VirtualList } from "react-window";
import type { RowComponentProps, ListImperativeAPI } from "react-window";

const allWeapons = weapons as Weapon[];
const BATCH_SIZE = 36;
const CARD_ROW_HEIGHT = 240;
const TABLE_ROW_HEIGHT = 48;

export default function WeaponsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Carregando...</div>}>
      <WeaponsPageContent />
    </Suspense>
  );
}

function WeaponsPageContent() {
  const { t } = useI18n();
  const { filters, setFilters } = useFilterURL();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortBy, setSortBy] = useState<string>("name");
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const listRef = useRef<ListImperativeAPI | null>(null);

  // Measure available height for the virtualized list
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(600);
  useEffect(() => {
    const updateHeight = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        setListHeight(Math.max(300, window.innerHeight - rect.bottom - 16));
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Measure container width to determine responsive column count
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columnCount = useMemo(() => {
    if (containerWidth >= 1024) return 3;
    if (containerWidth >= 640) return 2;
    return 1;
  }, [containerWidth]);

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
              if (perk === "spell")
                return pl.includes("spell") || pl.includes("cooldown") || pl.includes("front sweep") || pl.includes("wave") || pl.includes("strike");
              return pl.includes(perk);
            })
          );
        })
      );
    }
    if (filters.minTier > 1) {
      result = result.filter((w) => w.perks.some((tier) => tier.tier >= filters.minTier));
    }

    result = result.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "level": return a.level - b.level;
        case "attack": return b.attack - a.attack;
        case "tiers": return b.perks.length - a.perks.length;
        default: return 0;
      }
    });

    return result;
  }, [filters, sortBy]);

  // Reset display when filter/sort results change
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
    listRef.current?.scrollToRow({ index: 0 });
  }, [filteredWeapons]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedWeapons = useMemo(
    () => filteredWeapons.slice(0, displayCount),
    [filteredWeapons, displayCount]
  );

  const hasMore = displayCount < filteredWeapons.length;

  const cardRowCount = useMemo(
    () => Math.ceil(displayedWeapons.length / columnCount),
    [displayedWeapons.length, columnCount]
  );

  // Infinite scroll: load more items when user scrolls near the bottom
  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      if (!hasMore) return;
      const totalRows = viewMode === "card" ? cardRowCount : displayedWeapons.length;
      if (visibleRows.stopIndex >= totalRows - 3) {
        setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, filteredWeapons.length));
      }
    },
    [hasMore, viewMode, cardRowCount, displayedWeapons.length, filteredWeapons.length]
  );

  // Virtual row component for card grid view
  const CardRow = useCallback(
    ({ index, style }: RowComponentProps) => {
      const startIdx = index * columnCount;
      const items = displayedWeapons.slice(startIdx, startIdx + columnCount);
      return (
        <div style={style} className="flex gap-4 px-[1px]">
          {Array.from({ length: columnCount }).map((_, colIdx) => {
            const weapon = items[colIdx];
            if (!weapon) return <div key={`empty-${colIdx}`} className="flex-1" />;
            return (
              <div key={`cell-${weapon.id}`} className="flex-1 min-w-0">
                <WeaponCard weapon={weapon} index={(startIdx + colIdx) % 12} />
              </div>
            );
          })}
        </div>
      );
    },
    [displayedWeapons, columnCount]
  );

  // Virtual row component for table view
  const TableRow = useCallback(
    ({ index, style }: RowComponentProps) => {
      const weapon = displayedWeapons[index];
      return (
        <div style={style} className="flex border-b hover:bg-muted/50 text-sm">
          <div className="flex-1 py-3 px-2 font-medium min-w-0">
            <Link href={`/weapons/${weapon.id}`} className="hover:text-primary truncate block">
              {weapon.name}
            </Link>
          </div>
          <div className="w-24 py-3 px-2 capitalize shrink-0">{weapon.type}</div>
          <div className="w-36 py-3 px-2 shrink-0">
            {weapon.vocation.map((v) => (
              <span key={v} className="inline-block bg-muted rounded px-1.5 py-0.5 text-xs mr-1 capitalize">{v}</span>
            ))}
          </div>
          <div className="w-16 py-3 px-2 text-right shrink-0">{weapon.attack || "-"}</div>
          <div className="w-16 py-3 px-2 text-right shrink-0">{weapon.level}</div>
          <div className="w-32 py-3 px-2 shrink-0">
            {weapon.perks.map((t) => (
              <span key={t.tier} className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded px-1.5 py-0.5 text-xs mr-1">
                T{t.tier}
              </span>
            ))}
          </div>
        </div>
      );
    },
    [displayedWeapons]
  );

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
    setDisplayCount(BATCH_SIZE);
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
    };
  }, []);

  const loadingSpinner = hasMore ? (
    <div className="flex items-center justify-center py-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ) : filteredWeapons.length > 0 ? (
    <div className="text-center py-6 text-xs text-muted-foreground">
      {displayedWeapons.length}/{filteredWeapons.length} {t.weapons.found}
    </div>
  ) : null;

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
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={toolbarRef} className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="h-4 w-4 mr-1" /> {t.filters.title}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <FilterSidebar filters={filters} onFiltersChange={setFilters} />
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
            <div ref={gridContainerRef} className="flex-1 min-h-0">
              <VirtualList
                listRef={listRef}
                style={{ height: listHeight, width: "100%" }}
                rowCount={cardRowCount}
                rowHeight={CARD_ROW_HEIGHT}
                overscanCount={3}
                onRowsRendered={handleRowsRendered}
                rowComponent={CardRow}
                rowProps={{}}
              />
              {loadingSpinner}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-x-auto">
              <div className="flex border-b text-sm font-medium sticky top-0 bg-background z-10">
                <div className="flex-1 py-3 px-2">Name</div>
                <div className="w-24 py-3 px-2 shrink-0">Type</div>
                <div className="w-36 py-3 px-2 shrink-0">Vocation</div>
                <div className="w-16 py-3 px-2 shrink-0 text-right">Attack</div>
                <div className="w-16 py-3 px-2 shrink-0 text-right">Level</div>
                <div className="w-32 py-3 px-2 shrink-0">Perks</div>
              </div>
              <VirtualList
                listRef={listRef}
                style={{ height: listHeight - 41, width: "100%" }}
                rowCount={displayedWeapons.length}
                rowHeight={TABLE_ROW_HEIGHT}
                overscanCount={5}
                onRowsRendered={handleRowsRendered}
                rowComponent={TableRow}
                rowProps={{}}
              />
              {loadingSpinner}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
