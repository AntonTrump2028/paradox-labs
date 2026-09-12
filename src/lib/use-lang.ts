import { useEffect, useState } from "react";
import { COPY } from "./copy";
import { readLang, writeLang, type Lang } from "./lang";

export function useLang() {
  const [lang, setLang] = useState<Lang>("ru");

  useEffect(() => {
    setLang(readLang());
  }, []);

  function toggle() {
    const next: Lang = lang === "ru" ? "en" : "ru";
    setLang(next);
    writeLang(next);
  }

  return { lang, toggle, copy: COPY[lang] };
}
