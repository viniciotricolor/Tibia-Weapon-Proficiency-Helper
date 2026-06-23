export type WeaponType =
  | "axe"
  | "sword"
  | "club"
  | "rod"
  | "wand"
  | "distance"
  | "fist"
  | "soul weapon";

export type Vocation = "knight" | "paladin" | "sorcerer" | "druid";

export type HandSlot = "one-handed" | "two-handed";

export type WeaponTier = {
  tier: number;
  perks: string[];
};

export type Weapon = {
  id: string;
  name: string;
  type: WeaponType;
  vocation: Vocation[];
  attack: number;
  attackElement?: string;
  level: number;
  image: string;
  hand: HandSlot;
  perks: WeaponTier[];
  source: string;
};

export type ChangeType = "major" | "minor";

export type Change = {
  weapon: string;
  change_type: string;
  before?: string;
  after?: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  type: ChangeType;
  changes: Change[];
};

export type ModificationEffect =
  | "critical_chance"
  | "critical_damage"
  | "mana_leech"
  | "life_leech"
  | "mana_on_hit"
  | "life_on_hit"
  | "mana_on_kill"
  | "life_on_kill"
  | "bestiary_damage"
  | "skill_damage"
  | "skill_heal"
  | "armour_penetration"
  | "attack_bonus"
  | "defence_bonus"
  | "magic_level"
  | "speed"
  | "cooldown_reduction"
  | "spell_augment";

export type ModificationOption = {
  id: string;
  name: string;
  description: string;
  effect: ModificationEffect;
  values: string[];
  spell?: string;
};

export const MODIFICATION_COSTS = {
  firstSlot: 250,
  secondSlot: 1000,
  refineBase: 50,
  reshape: 500,
};

export const REQUIRED_LEVELS = {
  firstSlot: 3,
  secondSlot: 7,
};

export const SPELL_AUGMENTS: Record<Vocation, string[]> = {
  knight: ["Berserk", "Fierce Berserk", "Groundshaker", "Front Sweep", "Shield Slam"],
  paladin: ["Divine Caldera", "Divine Barrage", "Ethereal Barrage", "Divine Grenade", "Strong Ethereal Spear"],
  sorcerer: ["Energy Wave", "Hell's Core", "Great Fire Wave", "Rage of the Skies", "Death Echo"],
  druid: ["Strong Ice Wave", "Terra Wave", "Ice Burst", "Terra Burst", "Forked Glacier"],
};

export const MODIFICATION_EFFECTS: ModificationOption[] = [
  { id: "crit_chance", name: "Critical Hit Chance", description: "Aumenta a chance de dano critico", effect: "critical_chance", values: ["+1%", "+2%", "+3%", "+4%", "+5%"] },
  { id: "crit_damage", name: "Critical Extra Damage", description: "Aumenta o dano critico extra", effect: "critical_damage", values: ["+5%", "+10%", "+15%", "+20%", "+25%"] },
  { id: "mana_leech", name: "Mana Leech", description: "Drenagem de mana ao acertar", effect: "mana_leech", values: ["+3%", "+5%", "+8%", "+10%", "+12%"] },
  { id: "life_leech", name: "Life Leech", description: "Drenagem de vida ao acertar", effect: "life_leech", values: ["+3%", "+5%", "+8%", "+10%", "+12%"] },
  { id: "mana_hit", name: "Mana on Hit", description: "Recupera mana ao acertar um hit", effect: "mana_on_hit", values: ["+1", "+2", "+3", "+4", "+5"] },
  { id: "life_hit", name: "Life on Hit", description: "Recupera vida ao acertar um hit", effect: "life_on_hit", values: ["+1", "+3", "+5", "+8", "+10"] },
  { id: "mana_kill", name: "Mana on Kill", description: "Recupera mana ao abater criatura", effect: "mana_on_kill", values: ["+5", "+10", "+15", "+20", "+30"] },
  { id: "life_kill", name: "Life on Kill", description: "Recupera vida ao abater criatura", effect: "life_on_kill", values: ["+5", "+10", "+20", "+30", "+50"] },
  { id: "bestiary", name: "Bestiary Damage", description: "Dano extra contra criaturas do bestiario", effect: "bestiary_damage", values: ["+2%", "+4%", "+6%", "+8%", "+10%"] },
  { id: "skill_dmg", name: "Skill as Damage", description: "Parte da skill como dano extra", effect: "skill_damage", values: ["+2% skill", "+5% skill", "+8% skill", "+12% skill", "+15% skill"] },
  { id: "skill_heal", name: "Skill as Heal", description: "Parte da skill como cura extra", effect: "skill_heal", values: ["+2% skill", "+5% skill", "+8% skill", "+12% skill", "+15% skill"] },
  { id: "armour_pen", name: "Armour Penetration", description: "Penetracao de armadura", effect: "armour_penetration", values: ["+3%", "+6%", "+9%", "+12%", "+15%"] },
  { id: "atk_bonus", name: "Attack Bonus", description: "Aumenta o ataque da arma", effect: "attack_bonus", values: ["+1", "+2", "+3", "+4", "+5"] },
  { id: "def_bonus", name: "Defence Bonus", description: "Aumenta a defesa da arma", effect: "defence_bonus", values: ["+1", "+2", "+3", "+4", "+5"] },
  { id: "ml_bonus", name: "Magic Level", description: "Aumenta o magic level", effect: "magic_level", values: ["+1", "+1", "+2", "+2", "+3"] },
  { id: "speed", name: "Speed", description: "Aumenta a velocidade", effect: "speed", values: ["+2", "+4", "+6", "+8", "+10"] },
  { id: "cd_reduce", name: "Cooldown Reduction", description: "Reduz cooldown de spells", effect: "cooldown_reduction", values: ["-0.5s", "-1s", "-1.5s", "-2s", "-3s"] },
];
