/**
 * fetch-all-perk-icons.ts
 *
 * Script to fetch ALL weapon proficiency perk icons from TibiaWiki.
 * Run with: npx tsx scripts/fetch-all-perk-icons.ts
 */

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

const WIKI_API = "https://tibiawiki.com.br/api.php";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function computeMD5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

function getImageUrl(imageName: string): string {
  const md5 = computeMD5(imageName);
  return `https://www.tibiawiki.com.br/images/${md5[0]}/${md5.slice(0, 2)}/${imageName}`;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) return false;
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

async function searchImages(prefix: string): Promise<string[]> {
  const images: string[] = [];
  let continueParam = "";

  while (true) {
    const params = new URLSearchParams({
      action: "query",
      list: "allimages",
      aiprefix: prefix,
      ailimit: "500",
      format: "json",
    });
    if (continueParam) params.set("aicontinue", continueParam);

    const response = await fetch(`${WIKI_API}?${params}`, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) break;

    const data = await response.json();
    const allimages = data.query?.allimages || [];
    for (const img of allimages) {
      if (img.name.endsWith(".gif") || img.name.endsWith(".png")) {
        images.push(img.name);
      }
    }

    if (data.continue?.aicontinue) {
      continueParam = data.continue.aicontinue;
    } else {
      break;
    }
  }

  return images;
}

async function main() {
  console.log("=== TibiaWiki ALL Perk Icons Fetcher ===\n");

  const perksDir = path.join(__dirname, "..", "public", "perks");
  if (!fs.existsSync(perksDir)) {
    fs.mkdirSync(perksDir, { recursive: true });
  }

  // Search for all perk-related images
  const searchPrefixes = [
    "Perk_",
    "Weapon_Perk_",
    "Proficiency_",
    "Critical_",
    "Magic_Level",
    "Hit_Points",
    "Mana_",
    "Life_",
    "Speed",
    "Cooldown",
    "Armour_",
    "Attack_",
    "Defence_",
    "Shielding",
    "Bestiary_",
    "Spell_",
    "Skill_",
    "Damage",
    "Leech",
    "On_Hit",
    "On_Kill",
    "Bonus",
    "Element_",
    "Earth_",
    "Fire_",
    "Ice_",
    "Energy_",
    "Death_",
    "Holy_",
    "Physical_",
    "Front_Sweep",
    "Berserk",
    "Divine_",
    "Terra_",
    "Energy_",
    "Ice_Wave",
    "Great_Fire",
    "Rage_of",
    "Death_Echo",
    "Forked_",
    "Flurry_",
    "Rapid_",
    "Pummel",
    "Strong_",
    "Groundshaker",
    "Shield_Slam",
    "Ethereal_",
    "Grenade",
  ];

  const allImageNames = new Set<string>();

  for (const prefix of searchPrefixes) {
    console.log(`Searching: ${prefix}...`);
    const images = await searchImages(prefix);
    images.forEach((img) => allImageNames.add(img));
    console.log(`  Found ${images.length} images`);
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nTotal unique images found: ${allImageNames.size}`);

  // Filter for perk-related images
  const perkImages = Array.from(allImageNames).filter((name) => {
    const lower = name.toLowerCase();
    return (
      lower.includes("perk") ||
      lower.includes("critical") ||
      lower.includes("magic_level") ||
      lower.includes("hit_points") ||
      lower.includes("mana_") ||
      lower.includes("life_") ||
      lower.includes("speed") ||
      lower.includes("cooldown") ||
      lower.includes("armour") ||
      lower.includes("attack_bonus") ||
      lower.includes("defence_bonus") ||
      lower.includes("shielding") ||
      lower.includes("bestiary") ||
      lower.includes("spell_") ||
      lower.includes("skill_") ||
      lower.includes("damage") ||
      lower.includes("leech") ||
      lower.includes("on_hit") ||
      lower.includes("on_kill") ||
      lower.includes("bonus") ||
      lower.includes("element_") ||
      lower.includes("earth_") ||
      lower.includes("fire_") ||
      lower.includes("ice_") ||
      lower.includes("energy_") ||
      lower.includes("death_") ||
      lower.includes("holy_") ||
      lower.includes("physical_") ||
      lower.includes("front_sweep") ||
      lower.includes("berserk") ||
      lower.includes("divine_") ||
      lower.includes("terra_") ||
      lower.includes("wave") ||
      lower.includes("strike") ||
      lower.includes("burst") ||
      lower.includes("flurry") ||
      lower.includes("rapid") ||
      lower.includes("pummel") ||
      lower.includes("strong_") ||
      lower.includes("groundshaker") ||
      lower.includes("shield_slam") ||
      lower.includes("ethereal") ||
      lower.includes("grenade") ||
      lower.includes("rage") ||
      lower.includes("echo") ||
      lower.includes("forked")
    );
  });

  console.log(`Perk-related images: ${perkImages.length}\n`);

  // Download all perk images
  let successCount = 0;
  let failCount = 0;
  const results: { name: string; local: string }[] = [];

  for (const imageName of perkImages) {
    const cleanName = imageName
      .replace(/\.(gif|png)$/i, "")
      .replace(/ /g, "_")
      .toLowerCase();

    const url = getImageUrl(imageName);
    const localPath = path.join(perksDir, `${cleanName}.gif`);

    if (fs.existsSync(localPath)) {
      successCount++;
      results.push({ name: imageName, local: `/perks/${cleanName}.gif` });
      continue;
    }

    process.stdout.write(`  ${imageName}... `);
    const success = await downloadImage(url, localPath);

    if (success) {
      successCount++;
      results.push({ name: imageName, local: `/perks/${cleanName}.gif` });
      console.log("✓");
    } else {
      failCount++;
      console.log("✗");
    }

    await new Promise((r) => setTimeout(r, 50));
  }

  // Save manifest
  const manifestPath = path.join(perksDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), "utf-8");

  console.log("\n=== Summary ===");
  console.log(`Downloaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${perkImages.length}`);
  console.log(`Manifest: ${manifestPath}`);
}

main().catch(console.error);
