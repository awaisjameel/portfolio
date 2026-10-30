# Repository guidelines

Instructions for anyone working on this site, human or agent. [README.md](README.md) explains how to run it. This file explains how to change it safely.

**This repository is public, and it builds the live site at [afoxtech.com](https://afoxtech.com).** Treat every commit as published, including its diff and message.

## Project structure

| Path               | Contents                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `app/pages/`       | Home, case study, open source, résumé, contact, and writing pages                              |
| `app/components/`  | Page sections and diagrams. `FlowDiagram.vue` renders every animated diagram                   |
| `app/composables/` | Live stats, SEO tags, theme, command palette, and analytics events                             |
| `app/assets/css/`  | `main.css`: all design tokens and styles                                                       |
| `content/`         | Case studies, the résumé, and articles, in Markdown                                            |
| `modules/content/` | Renders Markdown at build time into `#content/meta` (lists) and `#content/body` (full pages)   |
| `shared/data/`     | Site copy (`site.ts`), packages (`open-source.ts`), diagrams (`flows.ts`), and stats snapshots |
| `shared/utils/`    | Pure, tested logic shared by the app, server, and config                                       |
| `server/api/`      | Contact form, daily stats, daily activity, and health check                                    |
| `server/routes/`   | `robots.txt`, `sitemap.xml`, and `llms.txt`                                                    |
| `scripts/`         | Content guard, résumé PDF, share images, site icons, and stats refresh                         |
| `tests/`           | Vitest unit tests                                                                              |

## Before every commit

Run these in order. All of them must pass.

```bash
npm test
npm run typecheck
NUXT_PUBLIC_SITE_URL=https://afoxtech.com npm run build
npm run check:content
npm run format:check
```

- A production build fails without an HTTPS `NUXT_PUBLIC_SITE_URL`. This is deliberate: it stops localhost URLs from reaching canonical tags and the sitemap.
- `check:content` scans the source and `.output/public`, so run it after building. A stale build gives a false pass, so confirm the build actually succeeded.
- Leave `NUXT_PUBLIC_WHATSAPP_NUMBER` unset for this build. The guard blocks phone numbers, and the number belongs only in the deployed environment.
- Without `.content-guard.local.json`, only the generic scan runs. That file is a gitignored JSON array of case-insensitive regular expressions. Never commit it, and never quote its patterns here.

For any visual change, also check the real page in a browser:

- Widths 320, 390, 768, and 1280 pixels, in light and dark themes.
- No sideways scrolling, and no console errors. A CSP violation shows up here.
- With reduced motion on, nothing moves and the page still makes sense.
- Keyboard use works, including visible focus.
- After changing a generated or running build, restart the server. A running Nitro process keeps serving the old build.

## Public content rules

The guard catches patterns, not judgment. Apply these yourself.

- **Claims:** every number, title, and client detail must trace to measured evidence or the owner's private claims register. Don't add or strengthen a claim because it reads well, and keep measurement dates.
- **Experience:** give start dates, such as "since 2016". Never state a duration.
- **Credit:** describe team products as shared work, and use "dominant" or "primary contributor" only where the evidence supports it.
- **Compliance:** make no compliance or certification claims. Use "security- and privacy-conscious".
- **Target roles:** state openness to a role honestly, and never present one as a past title.
- **Proprietary work:** leave out repository names, customers, carrier and fulfillment partner names, credentials, and internal details beyond the approved summary of each product.
- **Infrastructure:** publish patterns only. No hostnames, addresses, ports, server counts, instance sizes, or file paths, and no vendors beyond AWS. Diagrams use generic labels.
- **Phone numbers:** none in source, the résumé, or the PDF. The WhatsApp number reaches the site only through `NUXT_PUBLIC_WHATSAPP_NUMBER`.
- **Images:** remove all metadata, crop out anything private, and check backgrounds and screenshots for names or customer data.
- **Secrets:** never commit credentials or `.env` files. `.env.example` holds names only.

If a change conflicts with one of these rules, raise it before making the change.

## Writing style

- Write in the first person, in plain English, as a working engineer. Avoid marketing language.
- Use sentence case for headings, and keep buttons in plain English.
- Say what happened and why it mattered. Prefer one real detail to three adjectives.

## Content

### Case studies

Each file in `content/work/` is one page. `title`, `order`, `size`, `role`, `tagline`, `published`, `summary`, `description`, `lede`, `details`, `stats`, and `statsNote` are required, and the build fails if one is missing.

- `order` sets the position on the home page, and `slug` comes from the filename.
- `size: large` gets a full home entry. `size: compact` joins the smaller row below.
- `stats` needs exactly four items. `statsNote` says where they came from and what stays private.
- `tagline` is the short line on the share image, up to 64 characters. The image also shows the first three `stats`.
- `published` is the first publication date. Add `updated` when a page changes meaningfully.
- `visual` adds a small chart to the home entry: `tally` or `speed`.
- `image` needs `src`, `alt`, `width`, and `height`.

Place a diagram anywhere in the text with a marker on its own line:

```markdown
<!-- diagram:blue-green-release -->
```

Valid names are the keys of `flows` in `shared/data/flows.ts`, plus `quote-speed`. An unknown name fails the build. New diagrams and case studies also need the expected lists in `tests/content.spec.ts` updated.

### Résumé

`content/resume.md` feeds both `/resume` and the public PDF, which must stay one A4 page. After changing it:

```bash
NUXT_PUBLIC_SITE_URL=https://afoxtech.com npm run build
npm run resume:pdf
NUXT_PUBLIC_SITE_URL=https://afoxtech.com npm run build
```

The second build ships the new PDF. Commit `public/awais-jameel-resume.pdf`, then read the PDF and confirm it's still one page.

### Writing

The section stays hidden until `MINIMUM_ARTICLES` published articles exist. Copy `content/writing/_template.md` and remove `draft: true` to publish. Each new article needs `npm run og:image`, and `tests/social.spec.ts` fails until it has run. `tags` and `updated` are optional and appear in its link previews.

### Stats

`/api/stats` and `/api/activity` refresh daily and fall back to the snapshots in `shared/data/` when a lookup fails. Run `npm run stats:refresh` now and then, and commit the snapshots. A build that prerenders stale numbers still shows their date.

## Social sharing

Every page calls `usePageSeo` with a `kind` and a share card. Together they set the preview tags, the image, its description, and the page's structured data. Builders live in `shared/utils/social.ts`.

| Page type    | `kind`       | Link preview                                                      |
| ------------ | ------------ | ----------------------------------------------------------------- |
| Home, résumé | `profile`    | Portrait card, with Open Graph profile tags                       |
| Contact      | `contact`    | Portrait card with availability and email                         |
| Open source  | `collection` | Package and download totals                                       |
| Case study   | `case-study` | Tagline and first three stats, with article dates and a role line |
| Article      | `article`    | Title, description, and date, with tags and reading time          |

- **Images:** `npm run og:image` builds `public/og/*.png` and `scripts/og-cards.json` from the same copy the pages use. Commit both. The server has no browser, so images are never built during a deployment.
- **Keeping cards current:** `tests/social.spec.ts` fails when a card's text or numbers no longer match the images. Run `npm run og:image` after changing a title, tagline, the first three stats, or the proof numbers, or when `npm run stats:refresh` changes a rounded total.
- **Limits:** images are 1200x630 PNGs under 300 KB, so WhatsApp shows them. Case-study descriptions stay within 160 characters.
- **Portraits:** they appear on the home, résumé, and contact cards only.
- **Share row:** `ShareRow.vue` sits after the content on case studies and articles. Share links are plain URLs, so no platform script loads and the Content-Security-Policy doesn't change. A service with no prefill URL sets `copy` in `shareTargets`, which copies the post and then opens the site, as /dev/null does.
- **No X handle:** the owner has no X account, so leave out `twitter:site` and `twitter:creator`.
- **After deploying a changed preview:** platforms cache previews. Refresh them with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Site files

- **Icons:** `public/favicon.svg` is the source. `npm run icons` builds `favicon.ico`, `apple-touch-icon.png`, and the manifest icons from it. Commit the results. A missing `favicon.ico` still returns 200, because Nuxt answers with a placeholder that isn't an image, so check the file itself rather than the status code.
- **Manifest:** `public/site.webmanifest` repeats the site name and icon list. `tests/site-files.spec.ts` checks it against the images.
- **`llms.txt`:** `shared/utils/llms.ts` builds it from `site.ts` and each case study's `description`, so it updates itself and only ever repeats public copy.

## Design system

The look is a refined terminal: a monospace name mark, `#` section labels, and monospace dates, with readable sans-serif body text in one centered column.

- Use the tokens at the top of `main.css`. Never hard-code a color or font.
- There is one accent color. Every color needs a light and a dark value, in both dark-theme blocks.
- Fonts are self-hosted through Fontsource.
- Motion stays minimal outside the hero, and always respects reduced motion.
- Photos appear only in the About section. `site.photo` shows a 480 pixel square WebP.

Before designing anything new, ask the owner the open questions as selectable options, in rounds, with a recommended choice. Record the answers, then design.

## System diagrams

`FlowDiagram.vue` is one engine, and each diagram is data in `shared/data/flows.ts`. Add or change a diagram by editing that data, not by writing a new component. Layout and playback helpers live in `shared/utils/flow.ts`.

A spec defines nodes on a grid, edges, moving packets (`segments`), and timed `events` that change node state and write log lines. `row` is 0, 1, or 2, so every diagram keeps the same height and the hero doesn't jump between tabs.

Set three moments in each spec:

- `start`: where playback begins. Use 0 unless a diagram should open mid-story.
- `rest`: the finished still, shown before scripts run and to reduced-motion visitors. No packet may be in flight here.
- `loop`: when it repeats. Leave a few seconds after the last event so the ending can be read.

`tests/flow.spec.ts` enforces these, and also checks that labels fit their boxes down to phone width and that log lines stay within 34 characters. Add a `short` label for anything long, because narrow screens use it.

Update `description` whenever the story changes. It's the only version screen readers get, because the diagram and log are hidden from them.

`SystemsShowcase.vue` runs the home page tabs. It opens on the product tab and cycles through all three. Choosing a tab, or reaching the tabs by keyboard, stops the cycle on that illustration. Pause, an off-screen hero, and reduced motion also hold it.

## Behavior to preserve

- **Security headers:** they're set in `shared/utils/deployment.ts` and applied through `routeRules`. Adding an outside origin means changing the Content-Security-Policy, so prefer self-hosting.
- **HSTS:** it omits `includeSubDomains` on purpose, because that would force HTTPS on mail and other subdomains.
- **Fonts:** `assetsInlineLimit: 0` keeps fonts out of `data:` URLs, which the policy blocks.
- **Prerendering:** `failOnError` is on, so a broken internal link fails the build. Hidden routes must be ignored explicitly, as `modules/content/index.ts` does for writing.
- **Contact form:** it needs its honeypot field, origin check, rate limit, and server-side validation. Keep shared validation in `shared/utils/contact.ts`. Without SMTP settings, it reports that sending is unavailable. Port 465 uses implicit TLS.
- **Rate limits:** the client address comes from `X-Real-IP`, which the reverse proxy overwrites. Don't trust other forwarding headers.
- **Build-time values:** prerendered pages bake in the site URL, indexing, WhatsApp number, and analytics settings. Changing any of them requires a rebuild, not just a restart.
- **Dependencies:** versions are pinned exactly. `vue` must satisfy Nuxt's required version, or two copies of Vue break the server bundle. After upgrading Nuxt, align `vue` and do a clean install.

## Deployment

Production deploys from `main`. The server steps are in `DEPLOYMENT.md`, which is gitignored along with `nginx/`, `production.env.example`, and `.content-guard.local.json`. They're local to the owner's machine, so a fresh clone won't have them, and server details belong there rather than in this file.

Production is a shared host, so a deployment may only reload this application. Compare the other running services before and after, and verify on the live domain.

## Commits and pull requests

- Commit or push only when asked.
- Use imperative, descriptive subjects, matching the existing history.
- Stage explicit paths, and read the staged diff before committing.
- Add tests with behavior changes. Keep logic that can be tested in `shared/utils/`.
- Match the surrounding code: no semicolons, single quotes, two spaces, and comments only where the reason isn't obvious.
- Use UTF-8 and LF line endings, and let Prettier format everything.
- Don't add attribution for AI tools to commits or pull requests.
- Never add claude, ChatGPT, or other AI tool attributions to commits or pull requests.
