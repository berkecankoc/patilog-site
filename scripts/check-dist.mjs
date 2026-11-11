// Post-build checks for the static site. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const DIST = resolve('dist');
const BASE = '/patilog-site/';
// These URLs are entered in the App Store and Google Play and must keep working.
const REQUIRED = ['', 'tr/', 'privacy/', 'tr/privacy/', 'support/', 'tr/support/'];

const errors = [];

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
	);

if (!existsSync(DIST)) {
	console.error('dist/ not found. Run `npm run build` first.');
	process.exit(1);
}

for (const route of REQUIRED) {
	const file = join(DIST, route, 'index.html');
	if (!existsSync(file)) {
		errors.push(`missing required page ${BASE}${route}`);
		continue;
	}
	const html = readFileSync(file, 'utf8');
	const lang = route.startsWith('tr/') ? 'tr' : 'en';
	if (!html.includes(`<html lang="${lang}"`)) errors.push(`${BASE}${route}: expected lang="${lang}"`);
	if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${BASE}${route}: missing <title>`);
	if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${BASE}${route}: missing meta description`);
}

const isExternal = (ref) => /^([a-z]+:)?\/\//i.test(ref);

// Resolves an internal reference to a file in dist/, or returns null.
function targetFile(ref, fromFile) {
	const path = decodeURIComponent(ref.split(/[?#]/)[0]);
	let abs;
	if (path.startsWith(BASE)) abs = join(DIST, path.slice(BASE.length));
	else if (path.startsWith('/')) return null; // Outside the base path: would 404 on GitHub Pages.
	else abs = resolve(dirname(fromFile), path);
	return path.endsWith('/') ? join(abs, 'index.html') : abs;
}

function checkInternal(ref, file, rel) {
	const target = targetFile(ref, file);
	if (!target || !existsSync(target)) errors.push(`${rel}: broken internal link ${ref}`);
}

for (const file of walk(DIST).filter((f) => /\.(html|css)$/.test(f))) {
	const rel = relative(DIST, file);
	const text = readFileSync(file, 'utf8');

	if (text.includes('{{')) errors.push(`${rel}: unfilled {{placeholder}}`);

	// Only small first-party inline scripts are allowed; nothing may be loaded from a src.
	if (/<script\b[^>]*\bsrc=/i.test(text)) errors.push(`${rel}: script loaded from a src`);
	// Inline scripts must not reach the network either (e.g. a pasted analytics loader).
	for (const [, code] of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
		if (/https?:|\/\/[a-z0-9]|createElement\(\s*['"]script|fetch\(|sendBeacon|XMLHttpRequest|WebSocket|import\(/i.test(code)) {
			errors.push(`${rel}: inline script contains network-capable code`);
		}
	}

	// The privacy policy promises no third-party requests: resources (images, styles, fonts,
	// icons...) must come from this site. Plain <a> navigation links may point elsewhere.
	for (const [tag, name] of text.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
		for (const [, attr, value] of tag.matchAll(/\s(href|src|srcset)="([^"]*)"/gi)) {
			const refs = attr.toLowerCase() === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value];
			for (const ref of refs) {
				if (!ref || /^(#|mailto:|data:)/.test(ref)) continue;
				if (name.toLowerCase() === 'a') {
					if (/^http:/i.test(ref)) errors.push(`${rel}: insecure link ${ref}`);
					else if (!isExternal(ref)) checkInternal(ref, file, rel);
				} else if (isExternal(ref)) errors.push(`${rel}: external resource ${ref}`);
				else checkInternal(ref, file, rel);
			}
		}
	}
	for (const [, raw] of text.matchAll(/url\(([^)]+)\)/g)) {
		const ref = raw.trim().replace(/^['"]|['"]$/g, '');
		if (!ref || ref.startsWith('data:') || ref.startsWith('#')) continue;
		if (isExternal(ref)) errors.push(`${rel}: external resource ${ref}`);
		else checkInternal(ref, file, rel);
	}
}

for (const e of errors) console.error(`error: ${e}`);
if (errors.length) process.exit(1);
console.log(`dist OK: ${REQUIRED.length} required pages, no external resources or script sources, internal links resolve, no placeholders.`);
