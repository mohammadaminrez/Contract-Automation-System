"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = params.locale as Locale;

  const switchLocale = (newLocale: Locale) => {
    // Replace locale in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentLocale === locale
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          aria-label={`Switch to ${locale === 'en' ? 'English' : 'Italian'}`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
