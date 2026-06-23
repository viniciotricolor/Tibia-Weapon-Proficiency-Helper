"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Weapon } from "@/lib/types";
import { ExternalLink, Shield, Swords } from "lucide-react";
import Link from "next/link";

interface WeaponCardProps {
  weapon: Weapon;
  index: number;
}

const vocationColors: Record<string, string> = {
  knight: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paladin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sorcerer: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  druid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function WeaponCard({ weapon, index }: WeaponCardProps) {
  const wikiUrl = `https://tibiawiki.com.br/wiki/${encodeURIComponent(weapon.name)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group relative rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
    >
      <Link href={`/weapons/${weapon.id}`} className="absolute inset-0 z-10" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={weapon.image}
            alt={weapon.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {weapon.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">{weapon.type}</p>
          </div>
        </div>
        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Swords className="h-3 w-3" />
          {weapon.attackElement || weapon.attack}
        </span>
        <span>Lvl {weapon.level}</span>
        <span className="flex items-center gap-1">
          {weapon.hand === "one-handed" ? (
            <Shield className="h-3 w-3" />
          ) : (
            <Swords className="h-3 w-3" />
          )}
          {weapon.hand === "one-handed" ? "1H" : "2H"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {weapon.vocation.map((v) => (
          <span
            key={v}
            className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", vocationColors[v])}
          >
            {v}
          </span>
        ))}
      </div>

      <div className="space-y-1">
        {weapon.perks.slice(0, 2).map((tier) => (
          <div key={tier.tier} className="text-[10px] text-muted-foreground">
            <span className="font-medium">T{tier.tier}:</span> {tier.perks[0]}
            {tier.perks.length > 1 && (
              <span className="text-muted-foreground"> +{tier.perks.length - 1} mais</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
