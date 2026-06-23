"use client";

import { Heart, ExternalLink } from "lucide-react";
import { useI18n } from "./i18n-provider";

export function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-semibold text-sm mb-2">Tibia Weapon Proficiency Helper</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {t.footer.madeWith} <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> {t.footer.by}{" "}
              <span className="font-medium text-foreground">Vinicio Tricolor</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {t.footer.unofficial}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">{t.footer.credits}</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                {t.footer.data}{" "}
                <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  TibiaWiki BR
                  <ExternalLink className="inline h-3 w-3 ml-0.5" />
                </a>
              </li>
              <li>{t.footer.character} <span className="text-foreground">Vinicio Tricolor</span></li>
              <li>{t.footer.madeFor}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">{t.footer.support}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t.footer.supportDesc}{" "}
              <span className="font-medium text-foreground">Vinicio Tricolor</span> {locale === "pt" ? "no Tibia!" : "in Tibia!"}
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2">
              <span className="text-sm font-bold text-primary">Vinicio Tricolor</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {t.footer.anyValue}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-[10px] text-muted-foreground">
            Tibia e todas as imagens sao propriedade da CipSoft GmbH. &middot; Dados baseados na{" "}
            <a href="https://tibiawiki.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline">
              TibiaWiki BR
            </a>{" "}
            &middot; {t.footer.lastSync} {new Date().toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US")}
          </p>
        </div>
      </div>
    </footer>
  );
}
