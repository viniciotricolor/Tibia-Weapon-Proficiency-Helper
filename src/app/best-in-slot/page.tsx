"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Trophy, Swords, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";
import { useI18n } from "@/components/i18n-provider";

const allWeapons = weapons as Weapon[];

const vocationLabels: Record<string, string> = {
  knight: "Knight",
  paladin: "Paladin",
  sorcerer: "Sorcerer",
  druid: "Druid",
  monk: "Monk",
};

const vocationColors: Record<string, string> = {
  knight: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paladin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sorcerer: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  druid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  monk: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const levelRanges = [
  { label: "200-250", min: 200, max: 250 },
  { label: "250-300", min: 250, max: 300 },
  { label: "300-400", min: 300, max: 400 },
  { label: "400-500", min: 400, max: 500 },
  { label: "500+", min: 500, max: 9999 },
];

function getScore(w: Weapon): number {
  let score = w.attack;
  w.perks.forEach((tier) => {
    tier.perks.forEach((perk) => {
      const p = perk.toLowerCase();
      if (p.includes("critical hit chance")) score += 5;
      if (p.includes("critical extra damage") && !p.includes("para")) score += 3;
      if (p.includes("life leech") || p.includes("hit points on")) score += 2;
      if (p.includes("mana leech") || p.includes("mana on")) score += 2;
      if (p.includes("damage contra")) score += 4;
      if (p.includes("magic level") && !p.includes("extra")) score += 3;
    });
  });
  score += w.perks.length * 5;
  return score;
}

export default function BestInSlotPage() {
  const { t } = useI18n();
  const [selectedVocation, setSelectedVocation] = useState<string>("knight");
  const [selectedRange, setSelectedRange] = useState<string>("250-300");

  const range = levelRanges.find((r) => r.label === selectedRange) || levelRanges[1];

  const bestWeapons = useMemo(() => {
    const filtered = allWeapons.filter(
      (w) => w.vocation.includes(selectedVocation as never) && w.level >= range.min && w.level <= range.max
    );

    const byType: Record<string, Weapon[]> = {};
    filtered.forEach((w) => {
      if (!byType[w.type]) byType[w.type] = [];
      byType[w.type].push(w);
    });

    return Object.entries(byType).map(([type, weapons]) => ({
      type,
      best: weapons.sort((a, b) => getScore(b) - getScore(a))[0],
      alternatives: weapons.sort((a, b) => getScore(b) - getScore(a)).slice(1, 3),
    }));
  }, [selectedVocation, range]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Best in Slot</h1>
            <p className="text-muted-foreground">{t.bis2.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Vocation:</span>
          </div>
          {Object.entries(vocationLabels).map(([id, label]) => (
            <Button
              key={id}
              variant={selectedVocation === id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVocation(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Level:</span>
          </div>
          {levelRanges.map((r) => (
            <Button
              key={r.label}
              variant={selectedRange === r.label ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(r.label)}
            >
              {r.label}
            </Button>
          ))}
        </div>

        {bestWeapons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p>{t.bis2.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestWeapons.map(({ type, best, alternatives }) => (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    {type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/weapons/${best.id}`} className="block p-3 rounded-lg border-2 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors mb-2">
                    <div className="flex items-center gap-2">
                      <img src={best.image} alt={best.name} className="w-8 h-8 object-contain" />
                      <div>
                        <p className="font-semibold text-sm">{best.name}</p>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[9px]">Lvl {best.level}</Badge>
                          <Badge variant="outline" className="text-[9px]">Atk {best.attack}</Badge>
                          <Badge className={`text-[9px] ${vocationColors[best.vocation[0]]}`}>{best.vocation[0]}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {best.perks.slice(0, 2).map((tier) => (
                        <p key={tier.tier} className="text-[10px] text-muted-foreground">
                          <span className="text-primary">T{tier.tier}:</span> {tier.perks.join(", ")}
                        </p>
                      ))}
                    </div>
                  </Link>
                  {alternatives.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{t.bis2.alternatives}</p>
                      {alternatives.map((alt) => (
                        <Link key={alt.id} href={`/weapons/${alt.id}`} className="block p-2 rounded border hover:bg-accent transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={alt.image} alt={alt.name} className="w-5 h-5 object-contain" />
                              <span className="text-xs font-medium">{alt.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Lvl {alt.level}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
