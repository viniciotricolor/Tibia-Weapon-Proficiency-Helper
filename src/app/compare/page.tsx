"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { GitCompareArrows, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import weapons from "../../../data/weapons.json";
import type { Weapon } from "@/lib/types";
import { useI18n } from "@/components/i18n-provider";

const allWeapons = weapons as Weapon[];

function extractStats(weapon: Weapon) {
  const stats = { attack: weapon.attack, defence: 0, hp: 0, mp: 0, crit: 0, critDmg: 0, ml: 0, tiers: weapon.perks.length, bestiary: "" };
  weapon.perks.forEach((tier) => {
    tier.perks.forEach((perk) => {
      const p = perk.toLowerCase();
      if (p.includes("defence")) stats.defence += 1;
      if (p.includes("hit points on")) stats.hp += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
      if (p.includes("mana on")) stats.mp += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
      if (p.includes("critical hit chance")) stats.crit += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
      if (p.includes("critical extra damage") && !p.includes("para")) stats.critDmg += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
      if (p.includes("magic level") && !p.includes("extra")) stats.ml += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
      if (p.includes("damage contra")) stats.bestiary = perk;
    });
  });
  return stats;
}

export default function ComparePage() {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedWeapons = useMemo(
    () => selectedIds.map((id) => allWeapons.find((w) => w.id === id)).filter(Boolean) as Weapon[],
    [selectedIds]
  );

  const addWeapon = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeWeapon = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  const sortedWeapons = [...allWeapons].sort((a, b) => a.name.localeCompare(b.name));

  const [weaponSearch, setWeaponSearch] = useState("");
  const [showWeaponList, setShowWeaponList] = useState(false);
  const weaponListRef = useRef<HTMLDivElement>(null);

  const filteredWeapons = useMemo(() => {
    if (!weaponSearch) return sortedWeapons.filter((w) => !selectedIds.includes(w.id)).slice(0, 50);
    const q = weaponSearch.toLowerCase();
    return sortedWeapons
      .filter((w) => !selectedIds.includes(w.id))
      .filter((w) => w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || w.vocation.some((v) => v.includes(q)))
      .slice(0, 50);
  }, [weaponSearch, selectedIds]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (weaponListRef.current && !weaponListRef.current.contains(e.target as Node)) {
        setShowWeaponList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <GitCompareArrows className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t.compare2.title}</h1>
            <p className="text-muted-foreground">{t.compare2.subtitle}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">{t.compare2.addWeapon}</CardTitle></CardHeader>
          <CardContent>
            <div className="relative" ref={weaponListRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={weaponSearch}
                  onChange={(e) => { setWeaponSearch(e.target.value); setShowWeaponList(true); }}
                  onFocus={() => setShowWeaponList(true)}
                  placeholder={t.compare2.searchWeapon}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
                />
              </div>
              {showWeaponList && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredWeapons.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">{t.compare2.noResults}</div>
                  ) : (
                    filteredWeapons.map((w) => (
                      <button
                        key={w.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
                        onClick={() => {
                          addWeapon(w.id);
                          setShowWeaponList(false);
                          setWeaponSearch("");
                        }}
                      >
                        <span className="text-muted-foreground capitalize text-xs">{w.type}</span>
                        <span className="font-medium">{w.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Lvl {w.level}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedWeapons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <GitCompareArrows className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>{t.compare2.noWeapon}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedWeapons.map((weapon) => {
              const stats = extractStats(weapon);
              return (
                <Card key={weapon.id} className="relative">
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 w-6 p-0" onClick={() => removeWeapon(weapon.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <img src={weapon.image} alt={weapon.name} className="w-8 h-8 object-contain" />
                      <div>
                        <CardTitle className="text-sm">{weapon.name}</CardTitle>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[9px] capitalize">{weapon.type}</Badge>
                          <Badge variant="outline" className="text-[9px]">Lvl {weapon.level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Atk</span><span className="font-bold">{weapon.attack}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Def</span><span className="font-bold">+{stats.defence}</span></div>
                      {stats.hp > 0 && <div className="flex justify-between"><span className="text-muted-foreground">HP</span><span className="font-bold text-green-600">+{stats.hp}</span></div>}
                      {stats.mp > 0 && <div className="flex justify-between"><span className="text-muted-foreground">MP</span><span className="font-bold text-blue-600">+{stats.mp}</span></div>}
                      {stats.crit > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Crit</span><span className="font-bold text-red-600">+{stats.crit.toFixed(1)}%</span></div>}
                      {stats.critDmg > 0 && <div className="flex justify-between"><span className="text-muted-foreground">CritDmg</span><span className="font-bold text-orange-600">+{stats.critDmg.toFixed(1)}%</span></div>}
                      {stats.ml > 0 && <div className="flex justify-between"><span className="text-muted-foreground">ML</span><span className="font-bold text-purple-600">+{stats.ml}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Tiers</span><span className="font-bold">{stats.tiers}</span></div>
                    </div>
                    {stats.bestiary && (
                      <div className="text-xs p-2 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                        {stats.bestiary}
                      </div>
                    )}
                    <div className="space-y-1">
                      {weapon.perks.map((tier) => (
                        <div key={tier.tier} className="text-[10px]">
                          <span className="font-medium text-primary">T{tier.tier}:</span>{" "}
                          <span className="text-muted-foreground">{tier.perks.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
