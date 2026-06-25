export interface PerkNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  cost: number;
}

export interface MasteryTier {
  tier: number;
  perks: PerkNode[];
}

export interface WeaponMastery {
  id: string;
  name: string;
  weaponImage: string;
  level: number;
  exp: number;
  maxExp: number;
  availablePoints: number;
  tiers: MasteryTier[];
  selectedPerks: Record<number, string>;
}
