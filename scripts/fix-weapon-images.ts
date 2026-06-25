/**
 * fix-weapon-images.ts
 *
 * Script to fix weapon images that are incorrect.
 * Run with: npx tsx scripts/fix-weapon-images.ts
 */

import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

const WIKI_API = "https://tibiawiki.com.br/api.php";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function computeMD5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

interface Weapon {
  id: string;
  name: string;
  image: string;
  [key: string]: unknown;
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

  if (!response.ok) return null;

  const data = await response.json();
  return data.parse?.wikitext?.["*"] || null;
}

function extractImageName(wikitext: string, weaponName: string): string {
  const imgMatch = wikitext.match(/\[\[Imagem:([^\]|]+)/i);
  if (imgMatch) return imgMatch[1].replace(/ /g, "_");
  return `${weaponName.replace(/ /g, "_")}.gif`;
}

function getImageUrl(imageName: string): string {
  const md5 = computeMD5(imageName);
  return `https://www.tibiawiki.com.br/images/${md5[0]}/${md5.slice(0, 2)}/${imageName}`;
}

async function main() {
  console.log("=== Fix Weapon Images ===\n");

  const weaponsPath = path.join(__dirname, "..", "data", "weapons.json");
  const weapons: Weapon[] = JSON.parse(fs.readFileSync(weaponsPath, "utf-8"));

  const wrongImage = "https://www.tibiawiki.com.br/images/thumb/9/90/Reliable_Ram.gif/50px-Reliable_Ram.gif";
  const weaponsToFix = weapons.filter((w) => w.image === wrongImage);

  console.log(`Weapons with wrong image: ${weaponsToFix.length}`);
  console.log(`Total weapons: ${weapons.length}\n`);

  let fixedCount = 0;
  let failedCount = 0;

  for (const weapon of weaponsToFix) {
    process.stdout.write(`${weapon.name}... `);

    const wikitext = await fetchPageContent(weapon.name);
    if (!wikitext) {
      console.log("✗ (no wikitext)");
      failedCount++;
      continue;
    }

    const imageName = extractImageName(wikitext, weapon.name);
    const imageUrl = getImageUrl(imageName);

    weapon.image = imageUrl;
    fixedCount++;
    console.log(`✓ (${imageName})`);

    await new Promise((r) => setTimeout(r, 100));
  }

  fs.writeFileSync(weaponsPath, JSON.stringify(weapons, null, 2), "utf-8");

  console.log("\n=== Summary ===");
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Total: ${weaponsToFix.length}`);
  console.log(`\nSaved to ${weaponsPath}`);
}

main().catch(console.error);
