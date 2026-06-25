"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Swords, Menu, X, Moon, Sun, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useI18n } from "./i18n-provider";
import { localeNames } from "@/i18n";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleLocale = () => {
    setLocale(locale === "en" ? "pt" : "en");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Swords className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Tibia WP Helper</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4 ml-6">
          <Link href="/weapons" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t.nav.weapons}
          </Link>
          <Link href="/perks" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Perks
          </Link>
          <Link href="/simulator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t.nav.simulator}
          </Link>
          <Link href="/compare" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t.nav.compare}
          </Link>
          <Link href="/best-in-slot" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t.nav.bestInSlot}
          </Link>
          <Link href="/changelog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t.nav.changelog}
          </Link>
          <Link href="/mastery" className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium">
            Mastery <span className="text-[10px] opacity-70">Beta</span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleLocale} title={locale === "en" ? "Portugues" : "English"}>
            <Globe className="h-4 w-4" />
            <span className="ml-1 text-xs font-medium">{localeNames[locale]}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              <Shield className="h-4 w-4 mr-1" />
              TibiaWiki BR
            </Button>
          </a>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col py-2">
            <Link href="/weapons" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {t.nav.weapons}
            </Link>
            <Link href="/perks" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              Perks
            </Link>
            <Link href="/simulator" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {t.nav.simulator}
            </Link>
            <Link href="/compare" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {t.nav.compare}
            </Link>
            <Link href="/best-in-slot" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {t.nav.bestInSlot}
            </Link>
            <Link href="/changelog" className="py-2 text-sm text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {t.nav.changelog}
            </Link>
            <Link href="/mastery" className="py-2 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium" onClick={() => setMobileOpen(false)}>
              Mastery <span className="text-[10px] opacity-70">Beta</span>
            </Link>
            <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="py-2 text-sm text-muted-foreground hover:text-primary">
              TibiaWiki BR
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
