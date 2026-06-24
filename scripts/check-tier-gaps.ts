/**
 * check-tier-gaps.ts
 *
 * Checks for tier gaps or numbering issues in weapons.
 * Run with: npx tsx scripts/check-tier-gaps.ts
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

const issues: string[] = [];

for (const weapon of weapons) {
  const tiers = weapon.perks.map(t => t.tier).sort((a, b) => a - b);
  
  // Check if tiers start at 1
  if (tiers[0] !== 1) {
    issues.push(`${weapon.name}: Tiers don't start at 1 (starts at ${tiers[0]})`);
  }
  
  // Check for gaps in tier numbering
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i] !== tiers[i-1] + 1) {
      issues.push(`${weapon.name}: Tier gap between ${tiers[i-1]} and ${tiers[i]}`);
    }
  }
  
  // Check for duplicate tiers
  const uniqueTiers = new Set(tiers);
  if (uniqueTiers.size !== tiers.length) {
    issues.push(`${weapon.name}: Duplicate tier numbers`);
  }
}

console.log("=== Tier Gap Analysis ===\n");
console.log(`Total weapons: ${weapons.length}`);
console.log(`Issues found: ${issues.length}\n`);

if (issues.length > 0) {
  console.log("Issues:");
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log("No tier gap issues found!");
}
