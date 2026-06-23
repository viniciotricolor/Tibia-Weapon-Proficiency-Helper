"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import type { Weapon } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface SearchCommandProps {
  weapons: Weapon[];
}

export function SearchCommand({ weapons }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = weapons.filter((w) => {
    const nameMatch = w.name.toLowerCase().includes(query.toLowerCase());
    const perkMatch = w.perks.some((tier) =>
      tier.perks.some((perk) => perk.toLowerCase().includes(query.toLowerCase()))
    );
    return nameMatch || perkMatch;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground sm:w-96">
          <Search className="mr-2 h-4 w-4" />
          Search weapons or perks...
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-lg">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search weapons or perks (e.g. Mammal, Earth, cooldown)..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No weapons found.
            </Command.Empty>
            {filtered.slice(0, 20).map((weapon) => (
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
                <span className="ml-auto text-xs text-muted-foreground">Lvl {weapon.level}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
