"use client";

import { motion } from "motion/react";
import { ChangelogFeed } from "@/components/changelog-feed";
import changelog from "../../../data/changelog.json";
import type { ChangelogEntry } from "@/lib/types";

const entries = changelog as ChangelogEntry[];

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground mb-8">
          Historico de versoes do Tibia com mudancas em armas e proficiencia.
        </p>
        <ChangelogFeed entries={entries} />
      </motion.div>
    </div>
  );
}
