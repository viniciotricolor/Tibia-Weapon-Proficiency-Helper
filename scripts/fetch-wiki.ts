/**
 * fetch-wiki.ts
 *
 * Script to fetch weapon data from TibiaWiki BR.
 * Run with: npx tsx scripts/fetch-wiki.ts
 *
 * This script fetches weapon pages from TibiaWiki and parses the data.
 * It's intended for maintenance and data updates.
 */

interface FetchedWeapon {
  name: string;
  type: string;
  level: number;
  attack: number;
  vocation: string[];
  hand: string;
}

async function fetchWeaponPage(category: string): Promise<string> {
  const url = `https://tibiawiki.com.br/wiki/${encodeURIComponent(category)}`;
  console.log(`Fetching ${url}...`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "TibiaWeaponProficiencyHelper/1.0 (Educational Project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${category}: ${response.statusText}`);
  }

  return response.text();
}

function parseWeaponsFromHTML(html: string, weaponType: string): FetchedWeapon[] {
  const weapons: FetchedWeapon[] = [];

  const tableRegex = /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>/g;
  const tables = html.match(tableRegex) || [];

  for (const table of tables) {
    const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
    let match;

    while ((match = rowRegex.exec(table)) !== null) {
      const row = match[1];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      const cells: string[] = [];
      let cellMatch;

      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]*>/g, "").trim());
      }

      if (cells.length >= 5) {
        const name = cells[0];
        if (name && !name.includes("Nome") && name.length > 2) {
          weapons.push({
            name,
            type: weaponType,
            level: parseInt(cells[1]) || 0,
            attack: parseInt(cells[4]) || 0,
            vocation: [],
            hand: cells[3]?.includes("Uma") ? "one-handed" : "two-handed",
          });
        }
      }
    }
  }

  return weapons;
}

async function main() {
  console.log("Starting weapon data fetch from TibiaWiki BR...\n");

  const categories = ["Espadas", "Machados", "Clavas", "Rods", "Wands"];
  const allWeapons: FetchedWeapon[] = [];

  for (const category of categories) {
    try {
      const html = await fetchWeaponPage(category);
      const weapons = parseWeaponsFromHTML(html, category.toLowerCase());
      allWeapons.push(...weapons);
      console.log(`Found ${weapons.length} weapons in ${category}`);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    }
  }

  console.log(`\nTotal weapons found: ${allWeapons.length}`);
  console.log("\nNote: This is a basic parser. For production use, consider using");
  console.log("a more robust HTML parser or Tibia's official API if available.");
  console.log("\nWeapon data should be manually verified and enriched with perk data.");
}

main().catch(console.error);
