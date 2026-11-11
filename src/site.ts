export type Lang = 'en' | 'tr';
export type Page = 'home' | 'privacy' | 'support';

export const DEVELOPER_NAME = 'Berke Can Koç';
export const CONTACT_EMAIL = 'berkecan.koc.contact@gmail.com';
// The date this version of the privacy policy takes effect (its publication date).
// Change it whenever the policy content changes.
export const EFFECTIVE_DATE = '2026-11-11';

// Leave empty until the store listing is live; empty badges render as "coming soon".
export const STORE_URLS = {
	appStore: '',
	googlePlay: '',
};

// App source repository. Leave empty while it is private; when set, the site shows
// "open source" mentions and source code links.
export const SOURCE_URL = '';

export const GITHUB_PRIVACY_URL = 'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement';

const slugs: Record<Page, string> = { home: '', privacy: 'privacy/', support: 'support/' };

/** Base-aware URL of a page, e.g. pageUrl('tr', 'privacy') -> /patilog-site/tr/privacy/ */
export function pageUrl(lang: Lang, page: Page): string {
	return `${import.meta.env.BASE_URL}${lang === 'tr' ? 'tr/' : ''}${slugs[page]}`;
}

/** Formats an ISO date for display, e.g. "November 11, 2026" / "11 Kasım 2026". */
export function formatDate(iso: string, lang: Lang): string {
	return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
}

export const ui = {
	en: {
		home: 'Home',
		privacy: 'Privacy Policy',
		support: 'Support',
		otherLang: 'Türkçe',
		mainNav: 'Main',
		skip: 'Skip to content',
		tagline: 'Offline pet care tracker',
		sourceCode: 'Source code',
		theme: { label: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
		trademarks:
			'Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
	},
	tr: {
		home: 'Ana sayfa',
		privacy: 'Gizlilik Politikası',
		support: 'Destek',
		otherLang: 'English',
		mainNav: 'Ana menü',
		skip: 'İçeriğe geç',
		tagline: 'Çevrimdışı evcil hayvan bakım takibi',
		sourceCode: 'Kaynak kodu',
		theme: { label: 'Tema', system: 'Sistem', light: 'Açık', dark: 'Koyu' },
		trademarks:
			'Apple ve Apple logosu, Apple Inc.’in ABD’de ve diğer ülkelerde tescilli ticari markalarıdır. App Store, Apple Inc.’in hizmet markasıdır. Google Play ve Google Play logosu, Google LLC’nin ticari markalarıdır.',
	},
} as const;
