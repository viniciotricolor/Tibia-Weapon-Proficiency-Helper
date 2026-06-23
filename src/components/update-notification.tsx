"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

const LAST_VERSION_KEY = "last-weapon-version";
const CURRENT_VERSION = "2026-06-23";

export function UpdateNotification() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastVersion = localStorage.getItem(LAST_VERSION_KEY);
    if (lastVersion !== CURRENT_VERSION) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(LAST_VERSION_KEY, CURRENT_VERSION);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-background border rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t.update.newVersion}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t.update.lastUpdate} {CURRENT_VERSION}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={dismiss} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
