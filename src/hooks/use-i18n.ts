"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { AppLanguage, tr, TranslationKey } from "@/lib/i18n";

export function useI18n() {
  const { user } = useAuth();
  const [fallbackLanguage] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") {
      return "EN";
    }
    const stored = window.localStorage.getItem("sft_language");
    return stored === "ID" || stored === "EN" ? stored : "EN";
  });

  useEffect(() => {
    if (!user?.language) {
      return;
    }

    window.localStorage.setItem("sft_language", user.language);
  }, [user?.language]);

  const language = user?.language ?? fallbackLanguage;

  return {
    language,
    t: (key: TranslationKey) => tr(language, key),
  };
}
