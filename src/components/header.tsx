"use client";

import Link from "next/link";
import { Shield, Swords } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Swords className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Tibia WP Helper</span>
        </Link>
        <nav className="flex items-center gap-4 ml-6">
          <Link href="/weapons" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Weapons
          </Link>
          <Link href="/simulator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Simulator
          </Link>
          <Link href="/changelog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Changelog
          </Link>
        </nav>
        <div className="ml-auto">
          <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <Shield className="h-4 w-4 mr-1" />
              TibiaWiki BR
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
