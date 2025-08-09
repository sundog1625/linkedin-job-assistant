import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt'] as const;
export const localePrefix = 'as-needed'; // Don't add a prefix for the default locale

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });