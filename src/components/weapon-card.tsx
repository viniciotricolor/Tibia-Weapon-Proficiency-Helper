"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Weapon } from "@/lib/types";
import { ExternalLink, Shield, Swords, Star } from "lucide-react";
import Link from "next/link";
import { useFavoritesStore } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";

interface WeaponCardProps {
  weapon: Weapon;
  index: number;
}

const vocationColors: Record<string, string> = {
  knight: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paladin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sorcerer: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  druid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  monk: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const tierBadges: Record<string, { label: string; color: string }> = {
  "grand sanguine": { label: "GS", color: "bg-yellow-500 text-yellow-950" },
  sanguine: { label: "S", color: "bg-orange-500 text-orange-950" },
  soul: { label: "Soul", color: "bg-purple-500 text-purple-100" },
  Falcon: { label: "F", color: "bg-amber-500 text-amber-950" },
  cobra: { label: "C", color: "bg-green-500 text-green-950" },
  lion: { label: "L", color: "bg-blue-500 text-blue-100" },
  naga: { label: "N", color: "bg-cyan-500 text-cyan-950" },
  amber: { label: "A", color: "bg-yellow-600 text-yellow-100" },
  eldritch: { label: "E", color: "bg-violet-500 text-violet-100" },
  crypt: { label: "Cr", color: "bg-gray-500 text-gray-100" },
  moonsilver: { label: "M", color: "bg-indigo-400 text-indigo-950" },
  inferniarch: { label: "I", color: "bg-red-600 text-red-100" },
  gnome: { label: "G", color: "bg-teal-500 text-teal-950" },
};

function getWeaponTier(name: string): { label: string; color: string } | null {
  const lower = name.toLowerCase();
  for (const [key, badge] of Object.entries(tierBadges)) {
    if (lower.includes(key.toLowerCase())) return badge;
  }
  return null;
}

export function WeaponCard({ weapon, index }: WeaponCardProps) {
  const wikiUrl = `https://tibiawiki.com.br/wiki/${encodeURIComponent(weapon.name)}`;
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const tier = getWeaponTier(weapon.name);
  const fav = isFavorite(weapon.id);

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
          <div className="relative">
            <img
              src={weapon.image}
              alt={weapon.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                {weapon.name}
              </h3>
              {tier && (
                <span className={cn("px-1 py-0.5 rounded text-[8px] font-bold", tier.color)}>
                  {tier.label}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{weapon.type}</p>
          </div>
        </div>
        <div className="relative z-20 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(weapon.id);
            }}
            className="text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
          </button>
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
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
        {weapon.perks.length > 0 && (
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {weapon.perks.length}
          </span>
        )}
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
