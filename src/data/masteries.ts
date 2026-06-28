import type { WeaponMastery } from "@/types/mastery";
import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";

const allWeapons = weapons as Weapon[];

function getPerkIcon(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("hit points") || lower.includes("hp on hit"))
    return "/perks/proficiency_type_life_on_hit.gif";
  if (lower.includes("mana on hit"))
    return "/perks/proficiency_type_mana_on_hit.gif";
  if (lower.includes("life on kill"))
    return "/perks/proficiency_type_life_on_kill.gif";
  if (lower.includes("mana on kill"))
    return "/perks/proficiency_type_mana_on_kill.gif";
  if (lower.includes("life leech"))
    return "/perks/proficiency_type_life_leech.gif";
  if (lower.includes("mana leech"))
    return "/perks/proficiency_type_mana_leech.gif";
  if (lower.includes("critical") && lower.includes("earth") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_earth.gif";
  if (lower.includes("critical") && lower.includes("earth") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_earth.gif";
  if (lower.includes("critical") && lower.includes("fire") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_fire.gif";
  if (lower.includes("critical") && lower.includes("fire") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_fire.gif";
  if (lower.includes("critical") && lower.includes("ice") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_ice.gif";
  if (lower.includes("critical") && lower.includes("ice") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_ice.gif";
  if (lower.includes("critical") && lower.includes("energy") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_energy.gif";
  if (lower.includes("critical") && lower.includes("energy") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_energy.gif";
  if (lower.includes("critical") && lower.includes("death") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_death.gif";
  if (lower.includes("critical") && lower.includes("death") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_death.gif";
  if (lower.includes("critical") && lower.includes("holy") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_holy.gif";
  if (lower.includes("critical") && lower.includes("holy") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_holy.gif";
  if (lower.includes("critical") && lower.includes("physical") && lower.includes("damage"))
    return "/perks/proficiency_type_element_critical_dmg_physical.gif";
  if (lower.includes("critical") && lower.includes("physical") && lower.includes("chance"))
    return "/perks/proficiency_type_element_critical_chance_physical.gif";
  if (lower.includes("critical") && lower.includes("chance"))
    return "/perks/proficiency_type_critical_chance.gif";
  if (lower.includes("critical") && lower.includes("extra damage"))
    return "/perks/proficiency_type_critical_dmg.gif";
  if (lower.includes("critical") && lower.includes("damage"))
    return "/perks/proficiency_type_critical_dmg.gif";
  if (lower.includes("magic level") && lower.includes("earth"))
    return "/perks/earth-magic.gif";
  if (lower.includes("magic level") && lower.includes("fire"))
    return "/perks/fire-magic.gif";
  if (lower.includes("magic level") && lower.includes("ice"))
    return "/perks/ice-magic.gif";
  if (lower.includes("magic level") && lower.includes("energy"))
    return "/perks/energy-magic.gif";
  if (lower.includes("magic level") && lower.includes("death"))
    return "/perks/death-magic.gif";
  if (lower.includes("magic level") && lower.includes("holy"))
    return "/perks/holy-magic.gif";
  if (lower.includes("magic level"))
    return "/perks/magic-level.gif";
  if (lower.includes("cooldown"))
    return "/perks/proficiency_augment_cooldown.gif";
  if (lower.includes("damage against mammal") || lower.includes("damage contra mammal"))
    return "/perks/proficiency_type_bestiary_dmg_mammal.gif";
  if (lower.includes("damage against bird") || lower.includes("damage contra bird"))
    return "/perks/proficiency_type_bestiary_dmg_bird.gif";
  if (lower.includes("damage against demon") || lower.includes("damage contra demon"))
    return "/perks/proficiency_type_bestiary_dmg_demon.gif";
  if (lower.includes("damage against dragon") || lower.includes("damage contra dragon"))
    return "/perks/proficiency_type_bestiary_dmg_dragon.gif";
  if (lower.includes("damage against undead") || lower.includes("damage contra undead"))
    return "/perks/proficiency_type_bestiary_dmg_undead.gif";
  if (lower.includes("damage against reptile") || lower.includes("damage contra reptile"))
    return "/perks/proficiency_type_bestiary_dmg_reptile.gif";
  if (lower.includes("damage against construct") || lower.includes("damage contra construct"))
    return "/perks/proficiency_type_bestiary_dmg_construct.gif";
  if (lower.includes("damage against elemental") || lower.includes("damage contra elemental"))
    return "/perks/proficiency_type_bestiary_dmg_elemental.gif";
  if (lower.includes("damage against humanoid") || lower.includes("damage contra humanoid"))
    return "/perks/proficiency_type_bestiary_dmg_humanoid.gif";
  if (lower.includes("damage against giant") || lower.includes("damage contra giant"))
    return "/perks/proficiency_type_bestiary_dmg_giant.gif";
  if (lower.includes("damage against Fey") || lower.includes("damage contra Fey"))
    return "/perks/proficiency_type_bestiary_dmg_fey.gif";
  if (lower.includes("damage against plant") || lower.includes("damage contra plant"))
    return "/perks/proficiency_type_bestiary_dmg_plant.gif";
  if (lower.includes("damage against") || lower.includes("damage contra"))
    return "/perks/proficiency_type_bestiary_dmg_magical.gif";
  if (lower.includes("extra damage para") || lower.includes("extra damage for"))
    return "/perks/proficiency_type_perc_spell_dmg_magic.gif";
  if (lower.includes("extra healing"))
    return "/perks/proficiency_type_perc_spell_heal_magic.gif";
  if (lower.includes("shielding") && lower.includes("damage"))
    return "/perks/proficiency_type_perc_spell_dmg_shield.gif";
  if (lower.includes("shielding"))
    return "/perks/proficiency_type_skill_shield.gif";
  if (lower.includes("front sweep"))
    return "/perks/proficiency_spell_front_sweep.gif";
  if (lower.includes("berserk"))
    return "/perks/proficiency_spell_berserk.gif";
  if (lower.includes("terra strike") || lower.includes("terra wave") || lower.includes("terra burst"))
    return "/perks/proficiency_spell_terra_strike.gif";
  if (lower.includes("ice strike") || lower.includes("ice wave") || lower.includes("ice burst"))
    return "/perks/proficiency_spell_ice_strike.gif";
  if (lower.includes("energy strike") || lower.includes("energy wave"))
    return "/perks/proficiency_spell_energy_strike.gif";
  if (lower.includes("flame strike") || lower.includes("fire wave"))
    return "/perks/proficiency_spell_flame_strike.gif";
  if (lower.includes("death strike") || lower.includes("death echo"))
    return "/perks/proficiency_spell_death_strike.gif";
  if (lower.includes("divine caldera"))
    return "/perks/proficiency_spell_divine_caldera.gif";
  if (lower.includes("divine barrage"))
    return "/perks/proficiency_spell_divine_barrage.gif";
  if (lower.includes("ethereal spear"))
    return "/perks/proficiency_spell_ethereal_spear.gif";
  if (lower.includes("groundshaker"))
    return "/perks/proficiency_spell_groundshaker.gif";
  if (lower.includes("shield slam"))
    return "/perks/proficiency_spell_shield_slam.gif";
  if (lower.includes("flurry of blows"))
    return "/perks/proficiency_spell_flurry_of_blows.gif";
  if (lower.includes("spell") || lower.includes("rune"))
    return "/perks/proficiency_type_perc_spell_dmg_magic.gif";
  if (lower.includes("attack"))
    return "/perks/proficiency_type_skill_axe.gif";
  if (lower.includes("defence") || lower.includes("defense"))
    return "/perks/proficiency_type_skill_shield.gif";
  if (lower.includes("speed"))
    return "/perks/proficiency_augment_cooldown.gif";
  if (lower.includes("armour") || lower.includes("armor"))
    return "/perks/proficiency_type_armour_penetration.gif";
  if (lower.includes("skill"))
    return "/perks/proficiency_type_skill_magic.gif";
  return "/perks/proficiency_type_critical_dmg.gif";
}

function extractPerkName(text: string): string {
  const match = text.match(/[\+\-]\d+\.?\d*%\s*(.+)/i) || text.match(/[\+\-]\d+\s*(.+)/i);
  if (match) return match[1].trim().slice(0, 30);
  return text.slice(0, 30);
}

export function generateMasteryForWeapon(weapon: Weapon): WeaponMastery {
  const maxTier = Math.max(...weapon.perks.map((p) => p.tier));

  return {
    id: weapon.id,
    name: weapon.name,
    weaponImage: weapon.image,
    level: maxTier,
    exp: maxTier * 10000000,
    maxExp: maxTier * 10000000,
    availablePoints: 2,
    selectedPerks: {},
    tiers: weapon.perks.map((tierData) => ({
      tier: tierData.tier,
      perks: tierData.perks.map((perkText, index) => ({
        id: `t${tierData.tier}-${index}-${perkText.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)}`,
        name: extractPerkName(perkText),
        description: perkText,
        icon: getPerkIcon(perkText),
        unlocked: false,
        cost: tierData.tier <= 2 ? 1 : tierData.tier <= 4 ? 2 : 3,
      })),
    })),
  };
}

const cobraRod = allWeapons.find((w) => w.id === "cobra-rod");
export const cobraRodMastery = cobraRod
  ? generateMasteryForWeapon(cobraRod)
  : null;

export const allMasteries: WeaponMastery[] = allWeapons
  .filter((w) => w.perks.length > 0)
  .map(generateMasteryForWeapon);
