/**
 * fetch-perk-icons.ts
 *
 * Script to fetch weapon proficiency perk icons from TibiaWiki.
 * Run with: npx tsx scripts/fetch-perk-icons.ts
 *
 * Downloads perk icons to public/perks/ directory.
 */

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

const WIKI_API = "https://tibiawiki.com.br/api.php";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function computeMD5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

interface PerkIcon {
  id: string;
  name: string;
  image: string;
  localPath: string;
}

// Known perk icons from TibiaWiki
const PERK_ICONS: { id: string; wikiImage: string; name: string }[] = [
  { id: "hit-points", wikiImage: "Hit Points.gif", name: "Hit Points" },
  { id: "critical-hit", wikiImage: "Critical Hit.gif", name: "Critical Hit" },
  { id: "critical-damage", wikiImage: "Critical Damage.gif", name: "Critical Damage" },
  { id: "magic-level", wikiImage: "Magic Level.gif", name: "Magic Level" },
  { id: "mana-leech", wikiImage: "Mana Leech.gif", name: "Mana Leech" },
  { id: "life-leech", wikiImage: "Life Leech.gif", name: "Life Leech" },
  { id: "cooldown-reduction", wikiImage: "Cooldown Reduction.gif", name: "Cooldown Reduction" },
  { id: "speed", wikiImage: "Speed.gif", name: "Speed" },
  { id: "armour-penetration", wikiImage: "Armour Penetration.gif", name: "Armour Penetration" },
  { id: "earth-magic", wikiImage: "Earth Magic.gif", name: "Earth Magic" },
  { id: "fire-magic", wikiImage: "Fire Magic.gif", name: "Fire Magic" },
  { id: "ice-magic", wikiImage: "Ice Magic.gif", name: "Ice Magic" },
  { id: "energy-magic", wikiImage: "Energy Magic.gif", name: "Energy Magic" },
  { id: "death-magic", wikiImage: "Death Magic.gif", name: "Death Magic" },
  { id: "holy-magic", wikiImage: "Holy Magic.gif", name: "Holy Magic" },
  { id: "physical-damage", wikiImage: "Physical Damage.gif", name: "Physical Damage" },
  { id: "bestiary-damage", wikiImage: "Bestiary Damage.gif", name: "Bestiary Damage" },
  { id: "spell-damage", wikiImage: "Spell Damage.gif", name: "Spell Damage" },
  { id: "attack-bonus", wikiImage: "Attack Bonus.gif", name: "Attack Bonus" },
  { id: "defence-bonus", wikiImage: "Defence Bonus.gif", name: "Defence Bonus" },
  { id: "shielding", wikiImage: "Shielding.gif", name: "Shielding" },
  { id: "mana-on-hit", wikiImage: "Mana on Hit.gif", name: "Mana on Hit" },
  { id: "life-on-hit", wikiImage: "Life on Hit.gif", name: "Life on Hit" },
  { id: "mana-on-kill", wikiImage: "Mana on Kill.gif", name: "Mana on Kill" },
  { id: "life-on-kill", wikiImage: "Life on Kill.gif", name: "Life on Kill" },
  { id: "skill-damage", wikiImage: "Skill Damage.gif", name: "Skill Damage" },
  { id: "skill-heal", wikiImage: "Skill Heal.gif", name: "Skill Heal" },
  { id: "front-sweep", wikiImage: "Front Sweep.gif", name: "Front Sweep" },
  { id: "berserk", wikiImage: "Berserk.gif", name: "Berserk" },
  { id: "divine-caldera", wikiImage: "Divine Caldera.gif", name: "Divine Caldera" },
  { id: "terra-wave", wikiImage: "Terra Wave.gif", name: "Terra Wave" },
  { id: "energy-wave", wikiImage: "Energy Wave.gif", name: "Energy Wave" },
  { id: "ice-wave", wikiImage: "Ice Wave.gif", name: "Ice Wave" },
];

function getImageUrl(imageName: string): string {
  const md5 = computeMD5(imageName);
  return `https://www.tibiawiki.com.br/images/${md5[0]}/${md5.slice(0, 2)}/${imageName}`;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      console.error(`Failed to download ${url}: ${response.statusText}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return false;
  }
}

async function main() {
  console.log("=== TibiaWiki Perk Icon Fetcher ===\n");

  const perksDir = path.join(__dirname, "..", "public", "perks");
  if (!fs.existsSync(perksDir)) {
    fs.mkdirSync(perksDir, { recursive: true });
  }

  const results: PerkIcon[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const perk of PERK_ICONS) {
    const url = getImageUrl(perk.wikiImage);
    const localPath = path.join(perksDir, `${perk.id}.gif`);

    console.log(`Downloading: ${perk.name}...`);

    const success = await downloadImage(url, localPath);
    if (success) {
      results.push({
        id: perk.id,
        name: perk.name,
        image: url,
        localPath: `/perks/${perk.id}.gif`,
      });
      successCount++;
      console.log(`  ✓ Saved to /perks/${perk.id}.gif`);
    } else {
      failCount++;
      console.log(`  ✗ Failed`);
    }

    // Small delay to be nice to the server
    await new Promise((r) => setTimeout(r, 100));
  }

  // Save manifest
  const manifestPath = path.join(perksDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), "utf-8");

  console.log("\n=== Summary ===");
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${PERK_ICONS.length}`);
  console.log(`\nManifest saved to ${manifestPath}`);
}

main().catch(console.error);
