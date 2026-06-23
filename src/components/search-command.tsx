"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Command } from "cmdk";
import { Search, Star, TrendingUp } from "lucide-react";
import type { Weapon } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface SearchCommandProps {
  weapons: Weapon[];
}

const bestiaryMap: Record<string, string[]> = {
  "mammal": ["mammal", "mamífero"],
  "bird": ["bird", "ave", "pássaro"],
  "beast": ["beast", "animal", "besta"],
  "reptile": ["reptile", "reptil"],
  "insect": ["insect", "inseto"],
  "undead": ["undead", "morto-vivo", "zumbi", "esqueleto", "fantasma", "undead"],
  "demon": ["demon", "demônio", "diabo", "demon"],
  "magical": ["magical", "mágica", "elemental"],
  "lycanthrope": ["lycanthrope", "licântrope", "werewolf", "lobisomem"],
  "inkborn": ["inkborn", "ink"],
  "dragon": ["dragon", "dragão"],
  "amphibian": ["amphibian", "anfíbio"],
  "construct": ["construct", "construto", "golem"],
  "demonoid": ["demonoid", "demonóide"],
  "exotic": ["exotic", "exótico"],
  "fauna": ["fauna"],
  "giant": ["giant", "gigante"],
  "humanoid": ["humanoid", "humanoide"],
  "plant": ["plant", "planta"],
  "spirit": ["spirit", "espírito", "ghost", "fantasma"],
  "vermin": ["vermin", "verme", "praga"],
  "animal": ["animal"],
  "bog": ["bog", "pântano"],
  "aquatic": ["aquatic", "aquático", "water", "água"],
};

function scoreWeapon(weapon: Weapon, query: string): number {
  let score = 0;
  const q = query.toLowerCase();

  const nameMatch = weapon.name.toLowerCase().includes(q);
  if (nameMatch) score += 100;

  const typeMatch = weapon.type.toLowerCase().includes(q);
  if (typeMatch) score += 50;

  const sourceMatch = weapon.source.toLowerCase().includes(q);
  if (sourceMatch) score += 80;

  weapon.perks.forEach((tier) => {
    tier.perks.forEach((perk) => {
      const p = perk.toLowerCase();
      if (p.includes(q)) score += 30;
    });
  });

  Object.entries(bestiaryMap).forEach(([key, synonyms]) => {
    if (synonyms.some((s) => q.includes(s) || s.includes(q))) {
      weapon.perks.forEach((tier) => {
        tier.perks.forEach((perk) => {
          if (perk.toLowerCase().includes(key)) score += 60;
        });
      });
    }
  });

  if (weapon.perks.length >= 5) score += 10;
  if (weapon.level >= 300) score += 5;

  return score;
}

export function SearchCommand({ weapons }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) return weapons.slice(0, 20);
    return [...weapons]
      .map((w) => ({ weapon: w, score: scoreWeapon(w, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((item) => item.weapon);
  }, [weapons, query]);

  const bestMatch = useMemo(() => {
    if (!query || filtered.length === 0) return null;
    return filtered[0];
  }, [query, filtered]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground sm:w-96">
          <Search className="mr-2 h-4 w-4" />
          Search weapons, perks or monsters...
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-lg">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search weapons, perks, monsters (e.g. Mammal, Demon, Earth)..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No weapons found.
            </Command.Empty>

            {bestMatch && query && (
              <div className="mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                  <TrendingUp className="h-3 w-3" />
                  Best Match
                </div>
                <button
                  onClick={() => { router.push(`/weapons/${bestMatch.id}`); setOpen(false); }}
                  className="w-full text-left flex items-center gap-2 p-1 rounded hover:bg-background/50"
                >
                  <span className="capitalize text-muted-foreground text-xs">{bestMatch.type}</span>
                  <span className="font-medium text-sm">{bestMatch.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Lvl {bestMatch.level}</span>
                </button>
              </div>
            )}

            {filtered.map((weapon) => (
              <Command.Item
                key={weapon.id}
                value={weapon.name}
                onSelect={() => {
                  router.push(`/weapons/${weapon.id}`);
                  setOpen(false);
                }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span className="capitalize text-muted-foreground mr-2">{weapon.type}</span>
                <span className="font-medium">{weapon.name}</span>
                {weapon.perks.length >= 5 && <Star className="h-3 w-3 ml-1 text-amber-400 fill-amber-400" />}
                <span className="ml-auto text-xs text-muted-foreground">Lvl {weapon.level}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
