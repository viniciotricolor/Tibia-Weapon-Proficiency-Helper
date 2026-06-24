"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Star, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import weapons from "../../../data/weapons.json";
import type { Weapon } from "@/lib/types";

const allWeapons = weapons as Weapon[];

const PERK_CATEGORIES = [
  { id: "critical", label: "Critical", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
  { id: "attack", label: "Attack / Skill", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/20" },
  { id: "defence", label: "Defence", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800/20" },
  { id: "life", label: "Life Leech / HP", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
  { id: "mana", label: "Mana Leech / MP", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { id: "magic level", label: "Magic Level", color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
  { id: "bestiary", label: "Bestiary Damage", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
  { id: "spell", label: "Spell Effects", color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/20" },
  { id: "cooldown", label: "Cooldown", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20" },
  { id: "other", label: "Other", color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/20" },
];

function categorizePerk(perk: string): string {
  const p = perk.toLowerCase();
  if (p.includes("critical")) return "critical";
  if (p.includes("damage contra") || p.includes("bestiary")) return "bestiary";
  if (p.includes("life leech") || p.includes("hit points")) return "life";
  if (p.includes("mana leech") || p.includes("mana on")) return "mana";
  if (p.includes("magic level")) return "magic level";
  if (p.includes("cooldown")) return "cooldown";
  if (p.includes("attack") || p.includes("fighting")) return "attack";
  if (p.includes("defence") || p.includes("def")) return "defence";
  if (p.includes("spell")) return "spell";
  return "other";
}

function getPerkColor(perk: string): string {
  const cat = categorizePerk(perk);
  return PERK_CATEGORIES.find((c) => c.id === cat)?.color || "text-foreground";
}

export default function PerksPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"count" | "name">("count");

  const allPerks = useMemo(() => {
    const perkMap = new Map<string, { count: number; weapons: string[]; category: string }>();
    allWeapons.forEach((w) => {
      w.perks.forEach((t) => {
        t.perks.forEach((perk) => {
          const existing = perkMap.get(perk) || { count: 0, weapons: [], category: categorizePerk(perk) };
          existing.count++;
          if (!existing.weapons.includes(w.name)) existing.weapons.push(w.name);
          perkMap.set(perk, existing);
        });
      });
    });
    return Array.from(perkMap.entries()).map(([perk, data]) => ({
      perk,
      ...data,
    }));
  }, []);

  const filtered = useMemo(() => {
    let result = allPerks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.perk.toLowerCase().includes(q));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    result = result.sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      return a.perk.localeCompare(b.perk);
    });

    return result;
  }, [allPerks, search, selectedCategories, sortBy]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Star className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Perks</h1>
            <p className="text-muted-foreground">
              {allPerks.length} perks unicos em {allWeapons.length} armas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar perk..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "count" | "name")}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="count">Mais comuns</option>
              <option value="name">Alfabetico</option>
            </select>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PERK_CATEGORIES.map((cat) => {
            const count = allPerks.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${cat.bg} ${cat.color}`} style={{ backgroundColor: isSelected ? undefined : undefined }} />
                {cat.label}
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} perks encontrados
        </p>

        {/* Perks grid */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((item) => (
                <motion.div
                  key={item.perk}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <Card className="py-3">
                    <CardContent className="px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${getPerkColor(item.perk)}`}>
                            {item.perk}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Usado em {item.count} arma{item.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {item.count}x
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
