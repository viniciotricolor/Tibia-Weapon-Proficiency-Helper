"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import type { ChangelogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChangelogFeedProps {
  entries: ChangelogEntry[];
}

const typeConfig: Record<string, { label: string; className: string }> = {
  major: {
    label: "MAJOR",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  minor: {
    label: "MINOR",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  new_weapon: {
    label: "NEW WEAPON",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

const changeTypeConfig: Record<string, { label: string; className: string }> = {
  buff: { label: "Buff", className: "bg-green-100 text-green-700" },
  nerf: { label: "Nerf", className: "bg-red-100 text-red-700" },
  new_weapon: { label: "New", className: "bg-blue-100 text-blue-700" },
  new_feature: { label: "New Feature", className: "bg-purple-100 text-purple-700" },
  mechanics_change: { label: "Mechanics", className: "bg-orange-100 text-orange-700" },
};

export function ChangelogFeed({ entries }: ChangelogFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" 
    ? entries 
    : filter === "new_weapon"
      ? entries.filter((e) => e.changes.some((c) => c.change_type === "new_weapon"))
      : entries.filter((e) => e.type === filter);

  return (
    <div>
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="major">Major</TabsTrigger>
          <TabsTrigger value="minor">Minor</TabsTrigger>
          <TabsTrigger value="new_weapon">New Weapons</TabsTrigger>
        </TabsList>
      </Tabs>

      <Accordion type="multiple" className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((entry) => {
            const typeInfo = typeConfig[entry.type] || typeConfig.minor;
            return (
              <motion.div
                key={entry.version}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AccordionItem value={entry.version} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">v{entry.version}</span>
                      <Badge className={cn(typeInfo.className)}>{typeInfo.label}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {entry.changes.map((change, i) => {
                        const changeInfo = changeTypeConfig[change.change_type] || changeTypeConfig.buff;
                        return (
                          <div key={i} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                            <Badge variant="outline" className={cn("text-xs mt-0.5", changeInfo.className)}>
                              {changeInfo.label}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{change.weapon}</p>
                              {change.before && (
                                <p className="text-xs text-muted-foreground">
                                  <span className="line-through">{change.before}</span>
                                </p>
                              )}
                              {change.after && (
                                <p className="text-xs text-green-600 dark:text-green-400">{change.after}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Accordion>
    </div>
  );
}
