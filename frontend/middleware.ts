import createMiddleware from 'next-intl/middleware';
import { i18n } from './i18n/config';

export default createMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
});

export const config = {
  matcher: ['/', '/(it|en)/:path*'],
};
