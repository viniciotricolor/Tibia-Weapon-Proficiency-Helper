"use client";

import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import MasteryWindow from "@/components/mastery/MasteryWindow";

export default function MasteryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Beta Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Beta — Aguardando Summer Update 2026
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              A aba Mastery está em fase de testes. Dados e funcionalidades podem mudar quando o sistema for lançado oficialmente no jogo.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MasteryWindow />
      </motion.div>
    </div>
  );
}
