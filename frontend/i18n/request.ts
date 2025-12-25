import { getRequestConfig } from 'next-intl/server';
import { Locale, i18n } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure locale is valid
  if (!locale || !i18n.locales.includes(locale as Locale)) {
    locale = i18n.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
