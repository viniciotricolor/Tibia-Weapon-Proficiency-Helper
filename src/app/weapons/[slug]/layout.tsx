import weapons from "@/data/weapons.json";
import type { Weapon } from "@/lib/types";

export async function generateStaticParams() {
  const allWeapons = weapons as Weapon[];
  return allWeapons.map((w) => ({ slug: w.id }));
}

export default function WeaponLayout({ children }: { children: React.ReactNode }) {
  return children;
}
