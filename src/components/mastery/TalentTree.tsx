"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import type { WeaponMastery, PerkNode } from "@/types/mastery";
import { useMasteryStore } from "@/hooks/useMastery";

interface TalentTreeProps {
  mastery: WeaponMastery;
}

export default function TalentTree({ mastery }: TalentTreeProps) {
  const { selectPerk } = useMasteryStore();
  const [hoveredPerk, setHoveredPerk] = useState<PerkNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleSelect = (tier: number, perkId: string) => {
    selectPerk(tier, perkId);
  };

  const tierCount = mastery.tiers.length;

  return (
    <div className="flex flex-col">
      {/* Stars Row */}
      <div className={`grid gap-2 mb-2`} style={{ gridTemplateColumns: `repeat(${tierCount}, minmax(0, 1fr))` }}>
        {mastery.tiers.map((tier) => (
          <div key={tier.tier} className="flex justify-center">
            <Star
              className="w-4 h-4"
              style={{
                fill: tier.tier <= mastery.level ? "#f59e0b" : "hsl(var(--muted))",
                color: tier.tier <= mastery.level ? "#f59e0b" : "hsl(var(--muted))",
              }}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-sm overflow-hidden bg-secondary border border-border mb-3">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${(mastery.exp / mastery.maxExp) * 100}%` }}
        />
      </div>

      {/* Grid - N columns (tiers) */}
      <div className={`grid gap-2 p-3 bg-card border border-border rounded-lg`} style={{ gridTemplateColumns: `repeat(${tierCount}, minmax(0, 1fr))` }}>
        {mastery.tiers.map((tier) => (
          <div key={tier.tier} className="flex flex-col gap-2 items-center">
            {tier.perks.map((perk) => {
              const isSelected = mastery.selectedPerks[tier.tier] === perk.id;

              return (
                <motion.button
                  key={perk.id}
                  onClick={() => handleSelect(tier.tier, perk.id)}
                  onMouseEnter={(e) => {
                    setHoveredPerk(perk);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredPerk(null)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full aspect-square flex items-center justify-center cursor-pointer rounded-lg border-2 transition-all ${
                    isSelected
                      ? "bg-green-900/50 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                      : "bg-secondary border-border hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={perk.icon}
                    alt={perk.name}
                    className="w-12 h-12 object-contain"
                    style={{
                      imageRendering: "pixelated",
                      filter: isSelected ? "none" : "saturate(0.5)",
                    }}
                  />

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 border border-green-400 flex items-center justify-center">
                      <span className="text-white text-[6px] font-bold">✓</span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Descriptions Row */}
      <div className={`grid gap-2 mt-2 p-3 bg-secondary border border-border rounded-lg`} style={{ gridTemplateColumns: `repeat(${tierCount}, minmax(0, 1fr))` }}>
        {mastery.tiers.map((tier) => {
          const selectedPerkId = mastery.selectedPerks[tier.tier];
          const selectedPerk = tier.perks.find((p) => p.id === selectedPerkId);

          return (
            <div key={tier.tier} className="text-center min-h-[50px] flex items-center justify-center">
              {selectedPerk ? (
                <p className="text-muted-foreground text-[10px] leading-tight">
                  {selectedPerk.description}
                </p>
              ) : (
                <p className="text-muted-foreground text-[10px]">—</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredPerk && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[100] w-52 p-3 rounded-lg bg-card border border-border shadow-lg pointer-events-none"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 80,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <img
                src={hoveredPerk.icon}
                alt={hoveredPerk.name}
                className="w-6 h-6 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <h4 className="text-card-foreground text-xs font-bold">{hoveredPerk.name}</h4>
            </div>
            <p className="text-muted-foreground text-[10px]">{hoveredPerk.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
