"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FilterState } from "@/components/filter-sidebar";

function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search);
  const getArray = (key: string): string[] => {
    const val = params.get(key);
    return val ? val.split(",") : [];
  };
  return {
    handSlots: getArray("hand"),
    weaponTypes: getArray("type"),
    vocations: getArray("vocation"),
    families: getArray("family"),
    sources: getArray("source"),
    elements: getArray("element"),
    minTier: parseInt(params.get("tier") || "1") || 1,
    perkSearch: params.get("perk") || "",
    selectedPerks: getArray("perkCat"),
  };
}

function filtersToParams(filters: FilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.handSlots.length) params.hand = filters.handSlots.join(",");
  if (filters.weaponTypes.length) params.type = filters.weaponTypes.join(",");
  if (filters.vocations.length) params.vocation = filters.vocations.join(",");
  if (filters.families.length) params.family = filters.families.join(",");
  if (filters.sources.length) params.source = filters.sources.join(",");
  if (filters.elements && filters.elements.length) params.element = filters.elements.join(",");
  if (filters.minTier > 1) params.tier = String(filters.minTier);
  if (filters.perkSearch) params.perk = filters.perkSearch;
  if (filters.selectedPerks.length) params.perkCat = filters.selectedPerks.join(",");
  return params;
}

export function useFilterURL() {
  const router = useRouter();
  const [filters, setFiltersState] = useState<FilterState>(() => {
    if (typeof window !== "undefined") {
      return parseFilters(window.location.search);
    }
    return {
      handSlots: [], weaponTypes: [], vocations: [], families: [],
      sources: [], elements: [], minTier: 1, perkSearch: "", selectedPerks: [],
    };
  });

  useEffect(() => {
    setFiltersState(parseFilters(window.location.search));
  }, []);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersState(newFilters);
    const params = filtersToParams(newFilters);
    const qs = new URLSearchParams(params).toString();
    router.replace(`/weapons${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  return { filters, setFilters };
}
