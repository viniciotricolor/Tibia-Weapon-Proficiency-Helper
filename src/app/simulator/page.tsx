"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Calculator, Plus, RotateCcw, Swords, Shield, Heart,
  Droplets, Zap, Star, Gem, RefreshCw, Trash2, Share2, Check, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import weapons from "../../../data/weapons.json";
import {
  type Weapon,
  MODIFICATION_EFFECTS, MODIFICATION_COSTS, REQUIRED_LEVELS,
} from "@/lib/types";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

const allWeapons = weapons as Weapon[];

const vocationColors: Record<string, string> = {
  knight: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paladin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sorcerer: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  druid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  monk: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

type SelectedPerk = {
  tier: number;
  perkIndex: number;
  perk: string;
};

type ModifiedSlot = {
  tier: number;
  perkIndex: number;
  effectId: string;
  valueIndex: number;
  originalPerk: string;
};

function parsePerkStats(perks: SelectedPerk[], modifications: ModifiedSlot[]) {
  const stats = {
    attack: 0, defence: 0, hitPoints: 0, manaPoints: 0,
    criticalChance: 0, criticalDamage: 0, magicLevel: 0,
    shielding: 0, skillBonus: 0, cooldownReduction: 0,
    lifeLeech: 0, manaLeech: 0, bestiaryDamage: "",
    spellDamage: 0, healBonus: 0, speed: 0, armourPen: 0,
  };

  perks.forEach(({ perk }) => {
    const p = perk.toLowerCase();
    if (p.includes("+1 attack") || p.includes("+2 attack"))
      stats.attack += parseInt(perk.match(/\+(\d+)\s*attack/)?.[1] || "0");
    if (p.includes("defence modifier") || p.includes("+1 defence")) stats.defence += 1;
    if (p.includes("hit points on kill")) stats.hitPoints += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
    if (p.includes("mana on kill")) stats.manaPoints += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
    if (p.includes("hit points on hit")) stats.hitPoints += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
    if (p.includes("mana on hit")) stats.manaPoints += parseInt(perk.match(/\+(\d+)/)?.[1] || "0");
    if (p.includes("critical hit chance")) stats.criticalChance += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("critical extra damage") && !p.includes("para")) stats.criticalDamage += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("magic level")) { const v = parseInt(perk.match(/\+(\d+)/)?.[1] || "0"); if (v > 0 && v <= 10) stats.magicLevel += v; }
    if (p.includes("shielding como extra")) stats.shielding += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("fighting como extra") && p.includes("damage")) stats.skillBonus += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("cooldown para")) stats.cooldownReduction += parseInt(perk.match(/-(\d+)s/)?.[1] || "0");
    if (p.includes("mana leech para")) stats.manaLeech += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("damage contra")) stats.bestiaryDamage = perk;
    if (p.includes("magic level como extra damage")) stats.spellDamage += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
    if (p.includes("shielding como extra healing") || p.includes("fighting como extra healing")) stats.healBonus += parseFloat(perk.match(/([\d.]+)%/)?.[1] || "0");
  });

  modifications.forEach((mod) => {
    const effect = MODIFICATION_EFFECTS.find((e) => e.id === mod.effectId);
    if (!effect) return;
    const val = effect.values[mod.valueIndex];
    const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
    switch (effect.effect) {
      case "critical_chance": stats.criticalChance += num; break;
      case "critical_damage": stats.criticalDamage += num; break;
      case "mana_leech": stats.manaLeech += num; break;
      case "life_leech": stats.lifeLeech += num; break;
      case "mana_on_hit": stats.manaPoints += num; break;
      case "life_on_hit": stats.hitPoints += num; break;
      case "mana_on_kill": stats.manaPoints += num; break;
      case "life_on_kill": stats.hitPoints += num; break;
      case "attack_bonus": stats.attack += num; break;
      case "defence_bonus": stats.defence += num; break;
      case "magic_level": stats.magicLevel += num; break;
      case "speed": stats.speed += num; break;
      case "cooldown_reduction": stats.cooldownReduction += Math.abs(num); break;
      case "armour_penetration": stats.armourPen += num; break;
    }
  });

  return stats;
}

export default function SimulatorPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState("proficiency");
  const [selectedWeaponId, setSelectedWeaponId] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<Set<number>>(new Set());
  const [modifications, setModifications] = useState<ModifiedSlot[]>([]);
  const [showEffectPicker, setShowEffectPicker] = useState<{ tier: number; perkIndex: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedWeapon = useMemo(() => allWeapons.find((w) => w.id === selectedWeaponId), [selectedWeaponId]);

  const selectedPerks = useMemo(() => {
    if (!selectedWeapon) return [];
    const perks: SelectedPerk[] = [];
    selectedWeapon.perks.forEach((t) => {
      if (selectedTiers.has(t.tier)) {
        t.perks.forEach((perk, i) => {
          const isModified = modifications.some((m) => m.tier === t.tier && m.perkIndex === i);
          if (!isModified) perks.push({ tier: t.tier, perkIndex: i, perk });
        });
      }
    });
    return perks;
  }, [selectedWeapon, selectedTiers, modifications]);

  const stats = useMemo(() => parsePerkStats(selectedPerks, modifications), [selectedPerks, modifications]);

  const totalDust = useMemo(() => {
    let dust = 0;
    dust += modifications.length * MODIFICATION_COSTS.firstSlot;
    modifications.forEach((m) => { dust += m.valueIndex * MODIFICATION_COSTS.refineBase; });
    return dust;
  }, [modifications]);

  const toggleTier = (tier: number) => {
    setSelectedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) next.delete(tier);
      else next.add(tier);
      return next;
    });
  };

  const applyModification = (tier: number, perkIndex: number, effectId: string) => {
    const existing = modifications.find((m) => m.tier === tier && m.perkIndex === perkIndex);
    if (existing) {
      setModifications(modifications.filter((m) => !(m.tier === tier && m.perkIndex === perkIndex)));
    }
    setModifications([...modifications, {
      tier, perkIndex, effectId, valueIndex: 0,
      originalPerk: selectedWeapon?.perks.find((t) => t.tier === tier)?.perks[perkIndex] || "",
    }]);
    setShowEffectPicker(null);
  };

  const removeModification = (tier: number, perkIndex: number) => {
    setModifications(modifications.filter((m) => !(m.tier === tier && m.perkIndex === perkIndex)));
  };

  const refineModification = (tier: number, perkIndex: number, delta: number) => {
    setModifications(modifications.map((m) => {
      if (m.tier !== tier || m.perkIndex !== perkIndex) return m;
      const effect = MODIFICATION_EFFECTS.find((e) => e.id === m.effectId);
      if (!effect) return m;
      const newIdx = Math.max(0, Math.min(effect.values.length - 1, m.valueIndex + delta));
      return { ...m, valueIndex: newIdx };
    }));
  };

  const reset = () => {
    setSelectedWeaponId("");
    setSelectedTiers(new Set());
    setModifications([]);
    setTab("proficiency");
  };

  const sortedWeapons = [...allWeapons].sort((a, b) => a.name.localeCompare(b.name));

  const [weaponSearch, setWeaponSearch] = useState("");
  const [showWeaponList, setShowWeaponList] = useState(false);
  const weaponListRef = useRef<HTMLDivElement>(null);

  const filteredWeapons = useMemo(() => {
    if (!weaponSearch) return sortedWeapons.slice(0, 50);
    const q = weaponSearch.toLowerCase();
    return sortedWeapons
      .filter((w) => w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || w.vocation.some((v) => v.includes(q)))
      .slice(0, 50);
  }, [weaponSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (weaponListRef.current && !weaponListRef.current.contains(e.target as Node)) {
        setShowWeaponList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const w = params.get("w");
      const t = params.get("t");
      if (w) setSelectedWeaponId(w);
      if (t) setSelectedTiers(new Set(t.split(",").map(Number)));
    }
  }, []);

  const shareBuild = () => {
    const params = new URLSearchParams();
    if (selectedWeaponId) params.set("w", selectedWeaponId);
    if (selectedTiers.size > 0) params.set("t", Array.from(selectedTiers).join(","));
    const url = `${window.location.origin}/simulator?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportBuild = () => {
    if (!selectedWeapon) return;
    const lines = [
      `${selectedWeapon.name} (${selectedWeapon.type})`,
      `Level: ${selectedWeapon.level} | Atk: ${selectedWeapon.attack} | ${selectedWeapon.hand}`,
      `Vocation: ${selectedWeapon.vocation.join(", ")}`,
      "",
      "Selected Perks:",
      ...selectedPerks.map((p) => `  T${p.tier}: ${p.perk}`),
    ];
    if (modifications.length > 0) {
      lines.push("", "Modifications:");
      modifications.forEach((m) => {
        const eff = MODIFICATION_EFFECTS.find((e) => e.id === m.effectId);
        lines.push(`  ${eff?.name} ${eff?.values[m.valueIndex]}`);
      });
    }
    lines.push("", "Stats:");
    if (stats.attack > 0) lines.push(`  Attack: +${stats.attack}`);
    if (stats.defence > 0) lines.push(`  Defence: +${stats.defence}`);
    if (stats.criticalChance > 0) lines.push(`  Crit: +${stats.criticalChance.toFixed(1)}%`);
    if (stats.criticalDamage > 0) lines.push(`  Crit DMG: +${stats.criticalDamage.toFixed(1)}%`);
    if (stats.magicLevel > 0) lines.push(`  ML: +${stats.magicLevel}`);
    if (stats.cooldownReduction > 0) lines.push(`  CDR: -${stats.cooldownReduction}s`);
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t.simulator.title} <span className="text-sm font-normal text-muted-foreground align-super">Beta</span></h1>
            <p className="text-muted-foreground">{t.simulator.subtitle}</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="proficiency">{t.simulator.tabProficiency}</TabsTrigger>
            <TabsTrigger value="modify">{t.simulator.tabModify}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">{t.simulator.step1}</CardTitle></CardHeader>
              <CardContent>
                <div className="relative" ref={weaponListRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={showWeaponList ? weaponSearch : selectedWeapon ? `[${selectedWeapon.type}] ${selectedWeapon.name}` : ""}
                      onChange={(e) => { setWeaponSearch(e.target.value); setShowWeaponList(true); }}
                      onFocus={() => { setShowWeaponList(true); setWeaponSearch(""); }}
                      placeholder={t.simulator.searchWeapon}
                      className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                  {showWeaponList && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredWeapons.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">Nenhuma arma encontrada</div>
                      ) : (
                        filteredWeapons.map((w) => (
                          <button
                            key={w.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
                            onClick={() => {
                              setSelectedWeaponId(w.id);
                              setSelectedTiers(new Set());
                              setModifications([]);
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

            {selectedWeapon && tab === "proficiency" && (
              <Card>
                <CardHeader><CardTitle className="text-sm">{t.simulator.step2}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <img src={selectedWeapon.image} alt={selectedWeapon.name} className="w-10 h-10 object-contain" />
                    <div>
                      <p className="font-semibold">{selectedWeapon.name}</p>
                      <div className="flex gap-1">
                        {selectedWeapon.vocation.map((v) => (
                          <Badge key={v} className={cn("text-[10px] capitalize", vocationColors[v])}>{v}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedWeapon.perks.map((tierData) => {
                      const isSelected = selectedTiers.has(tierData.tier);
                      return (
                        <div key={tierData.tier}
                          className={cn("border rounded-lg p-3 transition-all cursor-pointer",
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                          onClick={() => toggleTier(tierData.tier)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: Math.min(tierData.tier, 7) }).map((_, i) => (
                                  <Star key={i} className={cn("h-3 w-3",
                                    i >= 5 ? "fill-yellow-300 text-yellow-300" : "fill-amber-400 text-amber-400")} />
                                ))}
                              </div>
                              <span className="font-semibold text-sm">Tier {tierData.tier}</span>
                            </div>
                            <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground")}>
                              {isSelected && <Plus className="h-3 w-3" />}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {tierData.perks.map((perk, i) => <p key={i} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-primary">•</span>{perk}</p>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTiers(new Set(selectedWeapon.perks.map((t) => t.tier)))}>{t.simulator.selectAll}</Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTiers(new Set())}>{t.simulator.deselectAll}</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedWeapon && tab === "modify" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gem className="h-4 w-4" /> Modify Perk Slots
                    <Badge variant="outline" className="text-[10px]">
                      {modifications.length}/2 {t.simulator.slotsUsed}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                    <p><strong>{t.simulator.firstSlot}:</strong> {MODIFICATION_COSTS.firstSlot} {t.simulator.dust}, {t.simulator.requiresLevel} {REQUIRED_LEVELS.firstSlot}</p>
                    <p><strong>{t.simulator.secondSlot}:</strong> {MODIFICATION_COSTS.secondSlot} {t.simulator.dust}, {t.simulator.requiresMastery} {REQUIRED_LEVELS.secondSlot})</p>
                    <p className="text-muted-foreground">{t.simulator.refineCosts} {MODIFICATION_COSTS.reshape} {t.simulator.dust}.</p>
                  </div>

                  {selectedWeapon.perks.map((tierData) => {
                    if (!selectedTiers.has(tierData.tier)) return null;
                    return tierData.perks.map((perk, i) => {
                      const mod = modifications.find((m) => m.tier === tierData.tier && m.perkIndex === i);
                      const effect = mod ? MODIFICATION_EFFECTS.find((e) => e.id === mod.effectId) : null;
                      const canModify = modifications.length < 2 || !!mod;

                      return (
                        <div key={`${tierData.tier}-${i}`}
                          className={cn("border rounded-lg p-3 transition-all",
                            mod ? "border-amber-500 bg-amber-500/5" : "border-border")}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">T{tierData.tier}</Badge>
                              {mod ? (
                                <div className="flex items-center gap-1">
                                  <Gem className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs font-medium text-amber-600">{effect?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {effect?.values[mod.valueIndex]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">{perk}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {mod ? (
                                <>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                                    onClick={() => refineModification(tierData.tier, i, -1)}
                                    disabled={mod.valueIndex === 0}>
                                    <RefreshCw className="h-3 w-3 rotate-180" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0"
                                    onClick={() => refineModification(tierData.tier, i, 1)}
                                    disabled={mod.valueIndex >= (effect?.values.length || 1) - 1}>
                                    <RefreshCw className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive"
                                    onClick={() => removeModification(tierData.tier, i)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="sm" className="h-6 text-[10px]"
                                  onClick={() => setShowEffectPicker({ tier: tierData.tier, perkIndex: i })}
                                  disabled={!canModify}>
                                  <Gem className="h-3 w-3 mr-1" /> Modify
                                </Button>
                              )}
                            </div>
                          </div>
                          {showEffectPicker?.tier === tierData.tier && showEffectPicker?.perkIndex === i && (
                            <div className="mt-2 border-t pt-2 space-y-1">
                              <p className="text-[10px] text-muted-foreground mb-1">{t.simulator.chooseEffect}</p>
                              <div className="grid grid-cols-2 gap-1">
                                {MODIFICATION_EFFECTS.map((eff) => (
                                  <button key={eff.id}
                                    className="text-left text-[10px] p-1.5 rounded hover:bg-accent transition-colors border"
                                    onClick={() => applyModification(tierData.tier, i, eff.id)}>
                                    <span className="font-medium">{eff.name}</span>
                                    <span className="text-muted-foreground block">{eff.values[0]}</span>
                                  </button>
                                ))}
                              </div>
                              <Button variant="ghost" size="sm" className="text-[10px] w-full"
                                onClick={() => setShowEffectPicker(null)}>{t.simulator.cancel}</Button>
                            </div>
                          )}
                        </div>
                      );
                    });
                  }).flat()}

                  {modifications.length > 0 && (
                    <div className="bg-muted rounded-lg p-3 text-xs">
                      <p>{t.simulator.totalDust}: <strong>{totalDust}</strong></p>
                      <p className="text-muted-foreground">{modifications.length}/2 {t.simulator.slotsUsed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t.simulator.statsSummary}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={shareBuild}>
                      {copied ? <Check className="h-3 w-3 mr-1" /> : <Share2 className="h-3 w-3 mr-1" />}
                      {copied ? t.simulator.copied : t.simulator.share}
                    </Button>
                    {selectedWeapon && (
                      <Button variant="ghost" size="sm" onClick={exportBuild}>
                        <Share2 className="h-3 w-3 mr-1" />
                        {t.export.copyText}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" />{t.simulator.reset}</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPerks.length === 0 && modifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{t.simulator.noWeapon}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">{t.simulator.perks} ({selectedPerks.length})</p>
                      {selectedPerks.map((p, i) => (
                        <div key={i} className="text-xs flex items-start gap-1">
                          <Badge variant="outline" className="text-[9px] shrink-0">T{p.tier}</Badge>
                          <span className="text-muted-foreground">{p.perk}</span>
                        </div>
                      ))}
                    </div>
                    {modifications.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-amber-600 uppercase">{t.simulator.modifications} ({modifications.length})</p>
                        {modifications.map((m, i) => {
                          const eff = MODIFICATION_EFFECTS.find((e) => e.id === m.effectId);
                          return (
                            <div key={i} className="text-xs flex items-center gap-1">
                              <Gem className="h-3 w-3 text-amber-500" />
                              <span>{eff?.name} {eff?.values[m.valueIndex]}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Stats Totais</p>
                      {stats.attack > 0 && <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Swords className="h-3 w-3" />Attack</span><span className="font-bold">+{stats.attack}</span></div>}
                      {stats.defence > 0 && <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Shield className="h-3 w-3" />Defence</span><span className="font-bold">+{stats.defence}</span></div>}
                      {stats.hitPoints > 0 && <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Heart className="h-3 w-3" />HP</span><span className="font-bold text-green-600">+{stats.hitPoints}</span></div>}
                      {stats.manaPoints > 0 && <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Droplets className="h-3 w-3" />MP</span><span className="font-bold text-blue-600">+{stats.manaPoints}</span></div>}
                      {stats.criticalChance > 0 && <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Zap className="h-3 w-3" />Crit</span><span className="font-bold text-red-600">+{stats.criticalChance.toFixed(1)}%</span></div>}
                      {stats.criticalDamage > 0 && <div className="flex justify-between text-sm"><span>Crit DMG</span><span className="font-bold text-orange-600">+{stats.criticalDamage.toFixed(1)}%</span></div>}
                      {stats.magicLevel > 0 && <div className="flex justify-between text-sm"><span>ML</span><span className="font-bold text-purple-600">+{stats.magicLevel}</span></div>}
                      {stats.cooldownReduction > 0 && <div className="flex justify-between text-sm"><span>CDR</span><span className="font-bold text-orange-600">-{stats.cooldownReduction}s</span></div>}
                      {stats.spellDamage > 0 && <div className="flex justify-between text-sm"><span>Spell DMG</span><span className="font-bold text-purple-600">+{stats.spellDamage.toFixed(1)}%</span></div>}
                      {stats.healBonus > 0 && <div className="flex justify-between text-sm"><span>Heal</span><span className="font-bold text-green-600">+{stats.healBonus.toFixed(1)}%</span></div>}
                      {stats.manaLeech > 0 && <div className="flex justify-between text-sm"><span>Mana Leech</span><span className="font-bold text-blue-600">+{stats.manaLeech.toFixed(1)}%</span></div>}
                      {stats.speed > 0 && <div className="flex justify-between text-sm"><span>Speed</span><span className="font-bold">+{stats.speed}</span></div>}
                      {stats.armourPen > 0 && <div className="flex justify-between text-sm"><span>Armour Pen</span><span className="font-bold">+{stats.armourPen.toFixed(1)}%</span></div>}
                      {stats.bestiaryDamage && <div className="flex justify-between text-sm"><span>Bestiary</span><span className="font-bold text-xs text-amber-600">{stats.bestiaryDamage}</span></div>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
