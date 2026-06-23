/**
 * fetch-wiki.ts
 *
 * Script to fetch weapon data from TibiaWiki BR including proficiency perks.
 * Run with: npx tsx scripts/fetch-wiki.ts
 *
 * Uses MediaWiki API to get wikitext, then parses it for weapon data + perks.
 */

import * as fs from "fs";
import * as path from "path";

const WIKI_API = "https://tibiawiki.com.br/api.php";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

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

const WEAPON_CATEGORIES = [
  "Espadas",
  "Machados",
  "Clavas",
  "Rods",
  "Wands",
  "Distância",
  "Punhos",
];

const TYPE_MAP: Record<string, string> = {
  Espadas: "sword",
  Machados: "axe",
  Clavas: "club",
  Rods: "rod",
  Wands: "wand",
  Distância: "distance",
  Punhos: "fist",
};

async function fetchCategoryMembers(category: string): Promise<string[]> {
  const members: string[] = [];
  let continueParam = "";

  while (true) {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: `Category:${category}`,
      cmlimit: "500",
      cmtype: "page",
      format: "json",
    });
    if (continueParam) params.set("cmcontinue", continueParam);

    const response = await fetch(`${WIKI_API}?${params}`, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      console.error(`Failed to fetch category ${category}: ${response.statusText}`);
      break;
    }

    const data = await response.json();
    const pages = data.query?.categorymembers || [];
    for (const page of pages) {
      members.push(page.title.replace(/_/g, " "));
    }

    if (data.continue?.cmcontinue) {
      continueParam = data.continue.cmcontinue;
    } else {
      break;
    }
  }

  return members;
}

async function fetchPageContent(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "wikitext",
    format: "json",
  });

  const response = await fetch(`${WIKI_API}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${title}: ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  return data.parse?.wikitext?.["*"] || null;
}

function getField(wikitext: string, field: string): string {
  const regex = new RegExp(`\\|\\s*${field}\\s*=\\s*(.+?)(?=\\n\\s*\\||\\n\\}\\})`, "i");
  const match = wikitext.match(regex);
  return match ? match[1].trim() : "";
}

function parseWeapon(wikitext: string, name: string, category: string): Weapon | null {
  const hasProficiency = /perk\d/.test(wikitext);
  if (!hasProficiency) return null;

  const level = parseInt(getField(wikitext, "levelrequired")) || 0;

  const vocationRaw = getField(wikitext, "vocrequired");
  const vocation: string[] = [];
  if (vocationRaw.includes("Knight")) vocation.push("knight");
  if (vocationRaw.includes("Paladin")) vocation.push("paladin");
  if (vocationRaw.includes("Sorcerer")) vocation.push("sorcerer");
  if (vocationRaw.includes("Druid")) vocation.push("druid");

  const hands = getField(wikitext, "hands");
  const hand = hands.includes("Duas") ? "two-handed" : "one-handed";

  const attackRaw = getField(wikitext, "attack");
  const attack = parseInt(attackRaw) || 0;

  const elementAttack = getField(wikitext, "elementattack");
  let attackElement: string | undefined;
  const elemMatch = elementAttack.match(/\d+\s+(.+)/);
  if (elemMatch) attackElement = elemMatch[1].replace(/\[\[.*?\|?(.*?)\]\]/g, "$1").trim();

  const perks: WeaponTier[] = [];
  for (let i = 1; i <= 14; i++) {
    const perkField = getField(wikitext, `perk${i}`);
    if (!perkField) continue;

    const perkTexts: string[] = [];
    const perkRegex = /\{\{Weapon Perk\|[^|]*\|[^|]*\|([^}]+)\}\}/g;
    let perkMatch;
    while ((perkMatch = perkRegex.exec(perkField)) !== null) {
      perkTexts.push(perkMatch[1].trim());
    }

    if (perkTexts.length === 0) {
      const simplePerkRegex = /\{\{Weapon Perk\|[^|]*\|([^}]+)\}\}/g;
      while ((perkMatch = simplePerkRegex.exec(perkField)) !== null) {
        perkTexts.push(perkMatch[1].trim());
      }
    }

    if (perkTexts.length > 0) {
      perks.push({ tier: i, perks: perkTexts });
    }
  }

  const imgMatch = wikitext.match(/\[\[Imagem:([^\]|]+)/i);
  const imageName = imgMatch ? imgMatch[1].replace(/ /g, "_") : `${name.replace(/ /g, "_")}.gif`;
  const image = `https://tibiawiki.com.br/images/${imageName}`;

  const sourceRaw = getField(wikitext, "droppedby");
  const source = sourceRaw.replace(/\[\[.*?\|?(.*?)\]\]/g, "$1").replace(/\./g, "").trim();

  return {
    id: slugify(name),
    name,
    type: TYPE_MAP[category] || category.toLowerCase(),
    vocation,
    attack,
    attackElement,
    level,
    image,
    hand,
    perks,
    source,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  console.log("=== TibiaWiki Weapon Scraper ===\n");

  const weaponsPath = path.join(__dirname, "..", "data", "weapons.json");
  let existingWeapons: Weapon[] = [];
  if (fs.existsSync(weaponsPath)) {
    existingWeapons = JSON.parse(fs.readFileSync(weaponsPath, "utf-8"));
  }

  const existingIds = new Set(existingWeapons.map((w) => w.id));
  const allWeapons: Weapon[] = [...existingWeapons];
  let newCount = 0;
  let skippedCount = 0;
  let noProfCount = 0;

  for (const category of WEAPON_CATEGORIES) {
    console.log(`\n--- ${category} ---`);

    const members = await fetchCategoryMembers(category);
    console.log(`${members.length} weapons in category`);

    for (const name of members) {
      const id = slugify(name);

      if (existingIds.has(id)) {
        skippedCount++;
        continue;
      }

      const wikitext = await fetchPageContent(name);
      if (!wikitext) {
        noProfCount++;
        continue;
      }

      const weapon = parseWeapon(wikitext, name, category);
      if (weapon) {
        allWeapons.push(weapon);
        existingIds.add(id);
        newCount++;
        console.log(`  + ${weapon.name} (${weapon.perks.length} tiers)`);
      } else {
        noProfCount++;
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Existing: ${existingWeapons.length}`);
  console.log(`New: ${newCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`No proficiency: ${noProfCount}`);
  console.log(`Total: ${allWeapons.length}`);

  fs.writeFileSync(weaponsPath, JSON.stringify(allWeapons, null, 2), "utf-8");
  console.log(`\nSaved to ${weaponsPath}`);
}

main().catch(console.error);
