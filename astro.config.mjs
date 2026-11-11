// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages project site: https://berkecankoc.github.io/patilog-site/
	site: 'https://berkecankoc.github.io',
	base: '/patilog-site',
	// Pages are emitted as <dir>/index.html, so every URL ends with a slash.
	// The store-facing URLs (/privacy/, /support/, ...) depend on this.
	trailingSlash: 'always',
	integrations: [icon()],
});
