# Awais Jameel portfolio

Source for the personal portfolio of Awais Jameel, a senior full-stack engineer and software architect.

Built with Nuxt 4 and Vue. Pages are prerendered, Markdown is rendered at build time, and a small Nitro server handles the contact form and daily stats refresh.

## Run locally

Requires Node.js 24 or newer.

```bash
npm install
npm run dev
```

The site opens on `http://localhost:3001`. Without SMTP settings, the contact form reports that sending is unavailable. See `.env.example` for all settings.

## Edit the site

| What                      | Where                        |
| ------------------------- | ---------------------------- |
| Case studies              | `content/work/*.md`          |
| Résumé                    | `content/resume.md`          |
| Articles                  | `content/writing/*.md`       |
| Status line, proof, roles | `shared/data/site.ts`        |
| Open-source list          | `shared/data/open-source.ts` |
| Animated system diagrams  | `shared/data/flows.ts`       |
| Colors, type, and layout  | `app/assets/css/main.css`    |

The writing section stays hidden until two published articles exist. Copy `content/writing/_template.md` to start one.

Read [AGENTS.md](AGENTS.md) before making changes. It covers the checks to run before a commit, the rules for public content, and how each part of the site works.

## Commands

| Command                 | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Start the development server                           |
| `npm run build`         | Build for production                                   |
| `npm test`              | Run the unit tests                                     |
| `npm run typecheck`     | Check types                                            |
| `npm run check:content` | Check published copy against the content rules         |
| `npm run stats:refresh` | Update the bundled registry and contribution snapshots |
| `npm run resume:pdf`    | Generate the résumé PDF from the built `/resume` page  |
| `npm run og:image`      | Generate the social preview image                      |

## Content

Code is available for reference. Written content, images, and the résumé are © Awais Jameel.
