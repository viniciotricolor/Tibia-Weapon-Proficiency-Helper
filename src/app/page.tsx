"use client";

import { motion } from "motion/react";
import { Swords, Shield, Heart, Zap, Star, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchCommand } from "@/components/search-command";
import Link from "next/link";
import weapons from "../../data/weapons.json";
import type { Weapon } from "@/lib/types";

const allWeapons = weapons as Weapon[];

const perks = [
  { icon: Heart, label: "Life Gain", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
  { icon: Zap, label: "Mana Gain", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { icon: Swords, label: "Critical Chance", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
  { icon: Shield, label: "Shielding", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800/20" },
  { icon: Star, label: "Bestiary Damage", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
];

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm font-medium mb-6"
        >
          <Swords className="h-4 w-4" />
          Weapon Proficiency System
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Tibia Weapon
          <br />
          <span className="text-primary">Proficiency Helper</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Consulte todas as armas, perks e valores de proficiencia do sistema de Weapon Proficiency do
          Tibia. Encontre a arma ideal para seu estilo de jogo.
        </p>

        <div className="flex justify-center mb-8">
          <SearchCommand weapons={allWeapons} />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/weapons">
            <Button size="lg">
              Browse All Weapons
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/simulator">
            <Button size="lg" variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Simulator
            </Button>
          </Link>
          <Link href="/changelog">
            <Button size="lg" variant="outline">
              View Changelog
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Popular Perks</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${perk.bg} mb-3`}>
                    <perk.icon className={`h-6 w-6 ${perk.color}`} />
                  </div>
                  <p className="text-sm font-medium">{perk.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center"
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-2">How Weapon Proficiency Works</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use its armas para ganhar experiencia e desbloquear perks. Cada arma tem 7 tiers de
              proficiencia, cada um desbloqueando novos bonus. Os perks ficam ativos apenas enquanto
              a arma estiver equipada.
            </p>
            <Link href="/weapons">
              <Button variant="link" className="text-sm">
                Explore all weapons <ArrowRight className="h-3 w-3 ml-1 inline" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
