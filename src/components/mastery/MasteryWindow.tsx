"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useMasteryStore } from "@/hooks/useMastery";
import { useSavedBuildsStore } from "@/hooks/useSavedBuilds";
import WeaponList from "./WeaponList";
import TalentTree from "./TalentTree";
import MasteryProgress from "./MasteryProgress";

export default function MasteryWindow() {
  const {
    getSelectedMastery,
    resetWeapon,
    selectedWeaponId,
  } = useMasteryStore();

  const { builds, saveBuild, deleteBuild } = useSavedBuildsStore();
  const [buildName, setBuildName] = useState("");
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);

  const mastery = getSelectedMastery();

  if (!mastery) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Select a weapon to view mastery.
      </div>
    );
  }

  const selectedPerksList = Object.entries(mastery.selectedPerks)
    .map(([tier, perkId]) => {
      const tierData = mastery.tiers.find((t) => t.tier === Number(tier));
      const perk = tierData?.perks.find((p) => p.id === perkId);
      return { tier: Number(tier), perk };
    })
    .filter((item) => item.perk)
    .sort((a, b) => a.tier - b.tier);

  const weaponBuilds = builds.filter((b) => b.weaponId === selectedWeaponId);

  const handleSaveBuild = () => {
    if (!buildName.trim()) return;
    saveBuild({
      name: buildName.trim(),
      weaponId: selectedWeaponId,
      selectedPerks: mastery.selectedPerks,
    });
    setBuildName("");
  };

  const handleExportUrl = () => {
    const params = new URLSearchParams();
    params.set("weapon", selectedWeaponId);
    Object.entries(mastery.selectedPerks).forEach(([tier, perkId]) => {
      params.set(`t${tier}`, perkId);
    });
    const url = `${window.location.origin}/mastery?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert("Build URL copied to clipboard!");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 w-full max-w-7xl mx-auto">
      {/* Left Panel - Weapon List */}
      <div className="w-full lg:w-72 shrink-0">
        <WeaponList />
      </div>

      {/* Right Panel - Talent Tree */}
      <div className="flex-1 min-w-0">
        <Card className="rounded-l-none h-full border-l-0">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-foreground">
                Weapon Proficiency — {mastery.name}
              </h1>
              <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                {mastery.availablePoints} pts
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <MasteryProgress
                current={mastery.exp}
                max={mastery.maxExp}
                level={mastery.level}
              />
            </div>

            {/* Talent Tree */}
            <TalentTree mastery={mastery} />

            {/* Selected Perks Status */}
            <Card className="mt-4">
              <CardContent className="p-3">
                <h3 className="text-sm font-bold text-foreground mb-2 pb-2 border-b border-border">
                  Active Perks ({selectedPerksList.length})
                </h3>

                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-2">
                    {selectedPerksList.length === 0 ? (
                      <p className="text-muted-foreground text-xs">No perks selected yet</p>
                    ) : (
                      selectedPerksList.map((item) => (
                        <div
                          key={item.perk!.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary border border-border"
                        >
                          <img
                            src={item.perk!.icon}
                            alt={item.perk!.name}
                            className="w-4 h-4 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                          <span className="text-foreground text-[10px]">{item.perk!.description}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Save Build */}
            <Card className="mt-3">
              <CardContent className="p-3">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Build name..."
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveBuild()}
                  />
                  <Button size="sm" onClick={handleSaveBuild} disabled={!buildName.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportUrl}>
                    Export URL
                  </Button>
                </div>

                {weaponBuilds.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowSavedBuilds(!showSavedBuilds)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showSavedBuilds ? "▼" : "▶"} Saved builds ({weaponBuilds.length})
                    </button>
                    {showSavedBuilds && (
                      <div className="mt-2 flex flex-col gap-1">
                        {weaponBuilds.map((build) => (
                          <div
                            key={build.id}
                            className="flex items-center justify-between p-1.5 rounded bg-secondary border border-border"
                          >
                            <span className="text-xs text-foreground">{build.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 text-[10px] text-destructive"
                              onClick={() => deleteBuild(build.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button variant="outline" size="sm">
                Apply
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={resetWeapon}
              >
                Reset
              </Button>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
