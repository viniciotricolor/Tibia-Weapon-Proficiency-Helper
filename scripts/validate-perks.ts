/**
 * validate-perks.ts
 *
 * Validates weapon perks data for common issues.
 * Run with: npx tsx scripts/validate-perks.ts
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
  // Check if perks array is empty
  if (weapon.perks.length === 0) {
    issues.push(`${weapon.name}: No perks defined`);
    continue;
  }

  // Check tier numbering
  const tierNumbers = weapon.perks.map(t => t.tier);
  const expectedTiers = Array.from({ length: weapon.perks.length }, (_, i) => i + 1);
  if (JSON.stringify(tierNumbers) !== JSON.stringify(expectedTiers)) {
    issues.push(`${weapon.name}: Tier numbering mismatch (got ${tierNumbers.join(",")}, expected ${expectedTiers.join(",")})`);
  }

  // Check for empty perks
  for (const tier of weapon.perks) {
    if (tier.perks.length === 0) {
      issues.push(`${weapon.name}: Tier ${tier.tier} has no perks`);
    }
    for (const perk of tier.perks) {
      if (!perk || perk.trim() === "") {
        issues.push(`${weapon.name}: Tier ${tier.tier} has empty perk`);
      }
    }
  }

  // Check for duplicate perks within same tier
  for (const tier of weapon.perks) {
    const uniquePerks = new Set(tier.perks);
    if (uniquePerks.size !== tier.perks.length) {
      issues.push(`${weapon.name}: Tier ${tier.tier} has duplicate perks`);
    }
  }

  // Check for common typos or issues
  for (const tier of weapon.perks) {
    for (const perk of tier.perks) {
      if (perk.includes("  ")) {
        issues.push(`${weapon.name}: Tier ${tier.tier} perk has double spaces: "${perk}"`);
      }
      if (perk.endsWith(" ")) {
        issues.push(`${weapon.name}: Tier ${tier.tier} perk has trailing space: "${perk}"`);
      }
      if (perk.startsWith(" ")) {
        issues.push(`${weapon.name}: Tier ${tier.tier} perk has leading space: "${perk}"`);
      }
    }
  }
}

console.log("=== Perk Validation Results ===\n");
console.log(`Total weapons: ${weapons.length}`);
console.log(`Issues found: ${issues.length}\n`);

if (issues.length > 0) {
  console.log("Issues:");
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log("No issues found!");
}
