"use client";

import { motion } from "motion/react";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">No weapons found</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Try adjusting your filters or search criteria to find the weapons you are looking for.
      </p>
      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </motion.div>
  );
}
