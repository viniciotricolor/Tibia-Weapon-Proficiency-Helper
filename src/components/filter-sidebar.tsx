"use client";

import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, RotateCcw, Heart, Droplets, Zap, Shield, Sparkles, Swords, Gauge, Bug, Flame, Skull, Star } from "lucide-react";

export type FilterState = {
  handSlots: string[];
  weaponTypes: string[];
  vocations: string[];
  minTier: number;
  perkSearch: string;
  selectedPerks: string[];
};

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const handSlots = [
  { id: "one-handed", label: "One-Handed" },
  { id: "two-handed", label: "Two-Handed" },
];

const weaponTypes = [
  { id: "sword", label: "Swords" },
  { id: "axe", label: "Axes" },
  { id: "club", label: "Clubs" },
  { id: "rod", label: "Rods" },
  { id: "wand", label: "Wands" },
];

const vocations = [
  { id: "knight", label: "Knight" },
  { id: "paladin", label: "Paladin" },
  { id: "sorcerer", label: "Sorcerer" },
  { id: "druid", label: "Druid" },
];

const perkCategories = [
  {
    name: "Combat",
    icon: Swords,
    perks: [
      { id: "critical hit chance", label: "Critical Hit Chance", icon: Zap, color: "text-red-500" },
      { id: "critical extra damage", label: "Critical Extra Damage", icon: Flame, color: "text-orange-500" },
      { id: "attack", label: "Attack Bonus", icon: Swords, color: "text-red-400" },
      { id: "defence", label: "Defence Bonus", icon: Shield, color: "text-gray-400" },
      { id: "speed", label: "Speed", icon: Gauge, color: "text-yellow-500" },
    ],
  },
  {
    name: "Recovery",
    icon: Heart,
    perks: [
      { id: "hit points", label: "Hit Points", icon: Heart, color: "text-green-500", keywords: ["hit points on hit", "hit points on kill", "life"] },
      { id: "mana points", label: "Mana Points", icon: Droplets, color: "text-blue-500", keywords: ["mana on hit", "mana on kill", "mana"] },
    ],
  },
  {
    name: "Magic",
    icon: Sparkles,
    perks: [
      { id: "magic level", label: "Magic Level", icon: Sparkles, color: "text-purple-500" },
      { id: "spell", label: "Spell Effects", icon: Zap, color: "text-violet-500", keywords: ["spell", "cooldown", "front sweep", "wave", "strike"] },
    ],
  },
  {
    name: "Bestiary",
    icon: Bug,
    perks: [
      { id: "mammal", label: "Mammal", icon: Bug, color: "text-amber-500" },
      { id: "bird", label: "Bird", icon: Bug, color: "text-cyan-500" },
      { id: "beast", label: "Beast", icon: Bug, color: "text-emerald-500" },
      { id: "reptile", label: "Reptile", icon: Bug, color: "text-lime-500" },
      { id: "insect", label: "Insect", icon: Bug, color: "text-yellow-600" },
      { id: "undead", label: "Undead", icon: Skull, color: "text-gray-500" },
      { id: "demon", label: "Demon", icon: Skull, color: "text-red-600" },
    ],
  },
  {
    name: "Elements",
    icon: Flame,
    perks: [
      { id: "earth", label: "Earth", icon: Flame, color: "text-green-600" },
      { id: "fire", label: "Fire", icon: Flame, color: "text-orange-500" },
      { id: "ice", label: "Ice", icon: Flame, color: "text-blue-400" },
      { id: "energy", label: "Energy", icon: Flame, color: "text-yellow-400" },
      { id: "death", label: "Death", icon: Skull, color: "text-purple-600" },
    ],
  },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

export function FilterSidebar({
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const toggleFilter = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const togglePerk = (perkId: string) => {
    const current = filters.selectedPerks;
    const next = current.includes(perkId) ? current.filter((v) => v !== perkId) : [...current, perkId];
    onFiltersChange({ ...filters, selectedPerks: next });
  };

  const resetFilters = () => {
    onFiltersChange({
      handSlots: [],
      weaponTypes: [],
      vocations: [],
      minTier: 1,
      perkSearch: "",
      selectedPerks: [],
    });
  };

  const activeCount =
    filters.handSlots.length +
    filters.weaponTypes.length +
    filters.vocations.length +
    (filters.minTier > 1 ? 1 : 0) +
    (filters.perkSearch ? 1 : 0) +
    filters.selectedPerks.length;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Filters</h2>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset ({activeCount})
            </Button>
          )}
        </div>

        <FilterSection title="Search Perk">
          <input
            type="text"
            value={filters.perkSearch}
            onChange={(e) => onFiltersChange({ ...filters, perkSearch: e.target.value })}
            placeholder="e.g. Mammal, Earth, cooldown..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </FilterSection>

        <Separator />

        <FilterSection title="Perk Categories" icon={Star}>
          <div className="space-y-3">
            {perkCategories.map((category) => (
              <div key={category.name}>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <category.icon className="h-3 w-3" />
                  {category.name}
                </p>
                <div className="flex flex-wrap gap-1">
                  {category.perks.map((perk) => {
                    const isSelected = filters.selectedPerks.includes(perk.id);
                    return (
                      <button
                        key={perk.id}
                        onClick={() => togglePerk(perk.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-border"
                        )}
                      >
                        <perk.icon className={cn("h-2.5 w-2.5", isSelected ? "text-primary-foreground" : perk.color)} />
                        {perk.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </FilterSection>

        <Separator />

        <FilterSection title="Hand Slot">
          {handSlots.map((h) => (
            <label key={h.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
              <Checkbox
                checked={filters.handSlots.includes(h.id)}
                onCheckedChange={() => toggleFilter("handSlots", h.id)}
              />
              {h.label}
            </label>
          ))}
        </FilterSection>

        <Separator />

        <FilterSection title="Weapon Type">
          {weaponTypes.map((w) => (
            <label key={w.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
              <Checkbox
                checked={filters.weaponTypes.includes(w.id)}
                onCheckedChange={() => toggleFilter("weaponTypes", w.id)}
              />
              {w.label}
            </label>
          ))}
        </FilterSection>

        <Separator />

        <FilterSection title="Vocation">
          {vocations.map((v) => (
            <label key={v.id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
              <Checkbox
                checked={filters.vocations.includes(v.id)}
                onCheckedChange={() => toggleFilter("vocations", v.id)}
              />
              {v.label}
            </label>
          ))}
        </FilterSection>

        <Separator />

        <FilterSection title="Min Tier">
          <div className="px-2">
            <Slider
              value={[filters.minTier]}
              onValueChange={([v]) => onFiltersChange({ ...filters, minTier: v })}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1 text-center">Tier {filters.minTier}</p>
          </div>
        </FilterSection>
      </div>
    </ScrollArea>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
