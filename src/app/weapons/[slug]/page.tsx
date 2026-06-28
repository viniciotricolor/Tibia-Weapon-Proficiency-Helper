"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Shield, Swords, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/i18n-provider";
import { useFavoritesStore } from "@/hooks/useFavorites";
import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";
import Link from "next/link";

const allWeapons = weapons as Weapon[];

const vocationColors: Record<string, string> = {
  knight: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  paladin: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sorcerer: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  druid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  monk: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

function getPerkColor(perk: string): string {
  if (perk.includes("damage contra")) return "text-amber-600 dark:text-amber-400";
  if (perk.includes("critical")) return "text-red-600 dark:text-red-400";
  if (perk.includes("Magic Level")) return "text-purple-600 dark:text-purple-400";
  if (perk.includes("hit points")) return "text-green-600 dark:text-green-400";
  if (perk.includes("mana")) return "text-blue-600 dark:text-blue-400";
  if (perk.includes("cooldown")) return "text-orange-600 dark:text-orange-400";
  if (perk.includes("Shielding")) return "text-gray-600 dark:text-gray-400";
  return "text-foreground";
}

export default function WeaponDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { t } = useI18n();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const weapon = useMemo(
    () => allWeapons.find((w) => w.id === slug),
    [slug]
  );

  const similarWeapons = useMemo(() => {
    if (!weapon) return [];
    return allWeapons
      .filter((w) => w.id !== weapon.id && w.type === weapon.type && w.vocation.some((v) => weapon.vocation.includes(v)))
      .slice(0, 5);
  }, [weapon]);

  if (!weapon) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Weapon Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The weapon you are looking for does not exist.
        </p>
        <Link href="/weapons">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.detail.back}
          </Button>
        </Link>
      </div>
    );
  }

  const wikiUrl = `https://tibiawiki.com.br/wiki/${encodeURIComponent(weapon.name)}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/weapons" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.detail.back}
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={weapon.image}
                alt={weapon.name}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{weapon.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(weapon.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart className={cn("h-5 w-5", isFavorite(weapon.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                  </Button>
                </div>
                <p className="text-muted-foreground capitalize text-lg">{weapon.type}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {weapon.vocation.map((v) => (
                    <Badge key={v} className={cn("capitalize", vocationColors[v] || "")}>
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">{t.detail.weaponStats}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <Swords className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{weapon.attackElement || weapon.attack || "-"}</p>
                  <p className="text-xs text-muted-foreground">{t.detail.attack}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{weapon.level}</p>
                  <p className="text-xs text-muted-foreground">{t.detail.level}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{weapon.hand === "one-handed" ? "1H" : "2H"}</p>
                  <p className="text-xs text-muted-foreground">{t.detail.slot}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">{weapon.perks.length}</p>
                  <p className="text-xs text-muted-foreground">{t.detail.tiers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t.detail.proficiencyPerks}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {weapon.perks.map((tierData) => (
                  <div key={tierData.tier} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(tierData.tier, 7) }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i >= 5 ? "fill-yellow-300 text-yellow-300" : "fill-amber-400 text-amber-400"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-sm">Tier {tierData.tier}</span>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-amber-200 dark:border-amber-800">
                      {tierData.perks.map((perk, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 text-sm",
                            getPerkColor(perk)
                          )}
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-72 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full" variant="outline">
                    {t.detail.viewOnWiki}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t.detail.source}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{weapon.source}</p>
              </CardContent>
            </Card>

            {similarWeapons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t.detail.similarWeapons}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {similarWeapons.map((w) => (
                    <Link key={w.id} href={`/weapons/${w.id}`} className="block p-2 rounded border hover:bg-accent transition-colors">
                      <div className="flex items-center gap-2">
                        <img src={w.image} alt={w.name} className="w-5 h-5 object-contain" />
                        <span className="text-xs font-medium">{w.name}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">Lvl {w.level}</span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
