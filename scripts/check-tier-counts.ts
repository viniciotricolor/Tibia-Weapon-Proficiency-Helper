/**
 * check-tier-counts.ts
 *
 * Checks tier counts and perk counts for all weapons.
 * Run with: npx tsx scripts/check-tier-counts.ts
 */

import * as fs from "fs";
import * as path from "path";

interface WeaponTier {
  tier: number;
  perks: string[];
}

interface Weapon {
  id: string;
  name: string;
  type: string;
  vocation: string[];
  attack: number;
  attackElement?: string;
  level: number;
  image: string;
  hand: string;
  perks: WeaponTier[];
  source: string;
}

const weaponsPath = path.join(__dirname, "..", "data", "weapons.json");
const weapons: Weapon[] = JSON.parse(fs.readFileSync(weaponsPath, "utf-8"));

console.log("=== Tier Count Analysis ===\n");

// Group weapons by tier count
const tierCountMap = new Map<number, string[]>();
for (const weapon of weapons) {
  const tierCount = weapon.perks.length;
  if (!tierCountMap.has(tierCount)) {
    tierCountMap.set(tierCount, []);
  }
  tierCountMap.get(tierCount)!.push(weapon.name);
}

console.log("Weapons by tier count:");
for (const [count, names] of Array.from(tierCountMap.entries()).sort((a, b) => a[0] - b[0])) {
  console.log(`\nTier ${count}: ${names.length} weapons`);
  if (names.length <= 10) {
    names.forEach(name => console.log(`  - ${name}`));
  } else {
    console.log(`  - ${names.slice(0, 5).join(", ")}...`);
  }
}

console.log("\n=== Perk Count Analysis ===\n");

// Check perks per tier
const perksPerTier = new Map<number, number[]>();
for (const weapon of weapons) {
  for (const tier of weapon.perks) {
    if (!perksPerTier.has(tier.tier)) {
      perksPerTier.set(tier.tier, []);
    }
    perksPerTier.get(tier.tier)!.push(tier.perks.length);
  }
}

console.log("Perks per tier:");
for (const [tier, counts] of Array.from(perksPerTier.entries()).sort((a, b) => a[0] - b[0])) {
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const avg = (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);
  console.log(`Tier ${tier}: min=${min}, max=${max}, avg=${avg}`);
}

console.log("\n=== Cobra Rod Comparison ===\n");

const cobraRod = weapons.find(w => w.id === "cobra-rod");
if (cobraRod) {
  console.log("Cobra Rod perks:");
  cobraRod.perks.forEach(tier => {
    console.log(`\nTier ${tier.tier} (${tier.perks.length} perks):`);
    tier.perks.forEach(perk => console.log(`  - ${perk}`));
  });
} else {
  console.log("Cobra Rod not found!");
}
