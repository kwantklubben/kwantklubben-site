# kwantklubben-site

The public site for **Kwant Klubben**, live at `kwantklubben.com`. Plain
HTML/CSS/vanilla JS. GitHub Pages builds it with Jekyll (layouts, includes and
data files only, no plugins), so pushing to `main` is the deploy.

**Editing anything? Read [EDITING.md](EDITING.md).** Adding an event, publishing
a project or adding a partner is one YAML block in one file.

## Structure

```
_config.yml           build config + the site-wide links (join form, Discord, email)
_data/events.yml      every club event          -> /events, the banner on every page
_data/event_types.yml event types and their colours
_data/research.yml    every published project   -> /research, homepage teaser
_data/partners.yml    partners and their tier   -> /partners, homepage logo strip
_layouts/default.html head, event banner, nav, footer: the only copy
_includes/            join band, event/research/partner cards, social icons

index.html            landing: volatility surface, partner strip, the loop, recent projects
about/ events/ research/ partners/   one index.html each
sponsors/index.html   redirect stub -> /partners/ (the old URL is on LinkedIn)
research/papers/      research PDFs, linked from _data/research.yml

css/styles.css        the brand stylesheet (tokens + components)
js/kk-events.js       greys out past events and fills the next-event banner
js/kk-nav.js          mobile drawer (drives the `hidden` attribute, not a class)
js/kk-ticker.js       the partner logo strip
js/kk-volsurface.js   the hero's implied-volatility surface
tools/check-site.py   invariant + data checks, run in CI
tools/preview.sh      local preview with real Jekyll (optional)
```

There is no external data dependency: everything the site shows lives in this
repo, so nothing can break it from outside.

## The check

`python tools/check-site.py` runs in CI on every push (`.github/workflows/check.yml`),
next to a real Jekyll build whose output is asserted (every page wrapped in the
layout, no unrendered Liquid, data rendered into cards). It exists because the
July 2026 relaunch shipped bugs no diff showed. It checks:

| Invariant | Why |
|---|---|
| `_data/*.yml` entries are complete and well-formed | Members edit these on github.com; a typo must fail with a message, not render a blank card. |
| Join form / Discord / email only in `_config.yml` | One copy cannot drift. Every poster points at the join link. |
| The Chewy face is loaded | The 37vw footer wordmark is tuned to its metrics and clips without it. |
| No class on `<footer>` | `footer{display:block}` (0,0,1) undoes the wordmark overlay on phones; any class out-specifies it. |
| `#kk-nav-panel` ships with the `hidden` attribute | `kk-nav.js` is deferred; without it the drawer renders open on a cold mobile cache. |
| No inline `style=`, balanced CSS braces | 173 inline styles were lifted into classes; a stray `}` silently drops the next rule. |
| Every asset is used; sitemap lists every page | No dead files in a public repo; the hand-written sitemap cannot fall behind. |

`sponsors/index.html` opts out with a `REDIRECT` marker comment; skipped pages
are printed in the CI log.

## Deploy

Push to `main`. GitHub Pages deploys from `main` / root; the custom domain is
set in repo Settings → Pages.
