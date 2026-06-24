/**
 * fetch-html.ts
 *
 * Script to fetch weapon data from TibiaWiki BR by parsing HTML directly.
 * This bypasses Cloudflare API protection by fetching the full page.
 * Run with: npx tsx scripts/fetch-html.ts
 *
 * Usage:
 *   npx tsx scripts/fetch-html.ts              # Fetch all missing weapons
 *   npx tsx scripts/fetch-html.ts cobra-rod    # Fetch single weapon
 *   npx tsx scripts/fetch-html.ts --force      # Refetch all weapons
 */

import * as fs from "fs";
import * as path from "path";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const WIKI_BASE = "https://tibiawiki.com.br/wiki/";
const DELAY_MS = 500;

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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(title: string): Promise<string | null> {
  const url = `${WIKI_BASE}${encodeURIComponent(title)}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (!response.ok) {
      console.error(`  HTTP ${response.status} for ${title}`);
      return null;
    }
    return await response.text();
  } catch (e) {
    console.error(`  Error fetching ${title}: ${e}`);
    return null;
  }
}

function extractPerksFromHTML(html: string): WeaponTier[] | null {
  // Find the proficiency table
  const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi);
  if (!tableMatch) return null;

  let proficiencyTable: string | null = null;
  for (const table of tableMatch) {
    if (table.includes("Nível") && table.includes("Perks")) {
      proficiencyTable = table;
      break;
    }
  }
  if (!proficiencyTable) return null;

  // Normalize whitespace
  const normalized = proficiencyTable.replace(/\s+/g, " ");

  // Extract header row (Nível 1 2 3 4 5 6 7)
  const headerMatch = normalized.match(/<tr[^>]*>\s*<th[^>]*>\s*Nível\s*<\/th>([\s\S]*?)<\/tr>/i);
  if (!headerMatch) return null;

  // Extract tier numbers - skip first th (Nível label), take the rest
  const allTh = headerMatch[0].match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
  const tierNumbers: number[] = [];
  for (let i = 1; i < allTh.length; i++) { // Skip first th (Nível)
    const num = allTh[i].match(/>\s*(\d+)\s*</);
    if (num) tierNumbers.push(parseInt(num[1]));
  }

  if (tierNumbers.length === 0) return null;

  // Extract perks row
  const perksRowMatch = normalized.match(/<tr[^>]*>\s*<th[^>]*>\s*Perks\s*<\/th>([\s\S]*?)<\/tr>/i);
  if (!perksRowMatch) return null;

  const perksRow = perksRowMatch[1];
  // Split by <td> tags
  const tierCells = perksRow.split(/<td[^>]*>/i).filter((cell) => cell.trim().length > 0);

  const perks: WeaponTier[] = [];

  for (let i = 0; i < tierNumbers.length && i < tierCells.length; i++) {
    const cell = tierCells[i];
    const tier = tierNumbers[i];

    // Extract perk texts from divs with font-size:90%
    const perkTexts: string[] = [];
    // Match each div with font-size:90% individually
    const perkDivRegex = /<div[^>]*font-size:\s*90%[^>]*>([^<]+)<\/div>/gi;
    let perkMatch;
    while ((perkMatch = perkDivRegex.exec(cell)) !== null) {
      const text = perkMatch[1]
        .replace(/&#160;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();

      if (text && text.length > 2) {
        perkTexts.push(text);
      }
    }

    if (perkTexts.length > 0) {
      perks.push({ tier, perks: perkTexts });
    }
  }

  return perks.length > 0 ? perks : null;
}

function extractWeaponInfo(html: string, name: string): Partial<Weapon> | null {
  const info: Partial<Weapon> = {};

  // Extract level
  const levelMatch = html.match(/level\s+(\d+)\s+or higher/i);
  if (levelMatch) info.level = parseInt(levelMatch[1]);

  // Extract vocation
  info.vocation = [];
  if (html.includes("Knight")) info.vocation.push("knight");
  if (html.includes("Paladin")) info.vocation.push("paladin");
  if (html.includes("Sorcerer")) info.vocation.push("sorcerer");
  if (html.includes("Druid")) info.vocation.push("druid");

  // Extract hands
  if (html.includes("Duas mãos") || html.includes("two-handed")) {
    info.hand = "two-handed";
  } else {
    info.hand = "one-handed";
  }

  // Extract attack
  const attackMatch = html.match(/Attack:\s*(\d+)/i) || html.match(/Ataque:\s*(\d+)/i);
  if (attackMatch) info.attack = parseInt(attackMatch[1]);

  // Extract element attack
  const elementMatch = html.match(/(\d+)\s+(Fire|Ice|Earth|Energy|Death|Holy)/i);
  if (elementMatch) {
    info.attackElement = `+${elementMatch[1]} ${elementMatch[2]}`;
  }

  // Extract source
  const sourceMatch = html.match(/Loot de:([\s\S]*?)(?=<\/td>)/i);
  if (sourceMatch) {
    info.source = sourceMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\./g, "")
      .trim();
  }

  // Extract image
  const imgMatch = html.match(/src="(\/images\/[^"]*\.gif)"/i);
  if (imgMatch) {
    info.image = `https://www.tibiawiki.com.br${imgMatch[1]}`;
  }

  return info;
}

function inferType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("sword") || lower.includes("blade") || lower.includes("sabre") || lower.includes("claymore")) return "sword";
  if (lower.includes("axe") || lower.includes("hatchet")) return "axe";
  if (lower.includes("club") || lower.includes("mace") || lower.includes("hammer") || lower.includes("cudgel") || lower.includes("warhammer")) return "club";
  if (lower.includes("rod")) return "rod";
  if (lower.includes("wand") || lower.includes("coil")) return "wand";
  if (lower.includes("bow") || lower.includes("crossbow") || lower.includes("arbalest")) return "distance";
  if (lower.includes("fist") || lower.includes("claw")) return "fist";
  return "sword";
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const singleWeapon = args.find((a) => !a.startsWith("--"));

  console.log("=== TibiaWiki HTML Parser ===\n");

  const weaponsPath = path.join(__dirname, "..", "data", "weapons.json");
  let weapons: Weapon[] = [];
  if (fs.existsSync(weaponsPath)) {
    weapons = JSON.parse(fs.readFileSync(weaponsPath, "utf-8"));
  }

  const existingIds = new Set(weapons.map((w) => w.id));
  const weaponsToUpdate: string[] = [];

  if (singleWeapon) {
    weaponsToUpdate.push(singleWeapon);
  } else {
    // Find weapons with missing or incorrect perks
    for (const weapon of weapons) {
      if (force || weapon.perks.length === 0 || weapon.perks.some((t) => t.perks.length === 0)) {
        weaponsToUpdate.push(weapon.id);
      }
    }
  }

  console.log(`Weapons to update: ${weaponsToUpdate.length}\n`);

  let updated = 0;
  let failed = 0;

  for (const weaponId of weaponsToUpdate) {
    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon) {
      console.log(`  Skipping ${weaponId} - not found in data`);
      continue;
    }

    console.log(`Fetching ${weapon.name}...`);

    const html = await fetchPage(weapon.name);
    if (!html) {
      failed++;
      continue;
    }

    const perks = extractPerksFromHTML(html);
    if (!perks) {
      console.log(`  No proficiency data found for ${weapon.name}`);
      failed++;
      continue;
    }

    // Update weapon perks
    weapon.perks = perks;

    // Try to extract additional info
    const info = extractWeaponInfo(html, weapon.name);
    if (info) {
      if (info.level) weapon.level = info.level;
      if (info.vocation?.length) weapon.vocation = info.vocation;
      if (info.hand) weapon.hand = info.hand;
      if (info.attack) weapon.attack = info.attack;
      if (info.attackElement) weapon.attackElement = info.attackElement;
      if (info.source) weapon.source = info.source;
      if (info.image) weapon.image = info.image;
    }

    console.log(`  Updated: ${perks.length} tiers, ${perks.reduce((sum, t) => sum + t.perks.length, 0)} total perks`);
    updated++;

    if (updated % 50 === 0) {
      fs.writeFileSync(weaponsPath, JSON.stringify(weapons, null, 2), "utf-8");
      console.log(`  [Saved progress: ${updated} weapons updated]`);
    }

    await sleep(DELAY_MS);
  }

  // Save updated weapons
  fs.writeFileSync(weaponsPath, JSON.stringify(weapons, null, 2), "utf-8");

  console.log("\n=== Summary ===");
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total weapons: ${weapons.length}`);
  console.log(`Saved to: ${weaponsPath}`);
}

main().catch(console.error);
