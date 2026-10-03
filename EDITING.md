# Editing the site

Everything can be done on github.com: open the file, click the pencil, edit,
commit. A commit to `main` is live on kwantklubben.com about a minute later.

On every commit CI checks the site and builds it the way GitHub Pages does. If
something is wrong, the live site does **not** break: the last good version stays
up, and the red ✗ on the commit tells you which file and which line to fix.

---

## The three things you will actually do

### Add an event: `_data/events.yml`

Copy an existing block, paste it, change the values:

```yaml
- name: "Workshop #2"
  type: workshop          # workshop | company | talk | social
  date: 2026-10-22
  start: "16:00"          # Danish time, in quotes
  end: "18:00"
  location: U313, SDU Odense
  summary: Backtesting without fooling yourself.
  signup: https://...     # optional
```

That is all. The site sorts events by date, puts the next one in the banner at
the top of every page, builds the "Add to calendar" link, and greys an event out
once it is over. You never delete old events; they become the archive.

The types and their colours are in `_data/event_types.yml`. Rename the labels
there freely.

### Publish a project: `_data/research.yml`

1. If there is a paper, upload the PDF to `research/papers/` ("Add file" →
   "Upload files"). Use a short name without spaces: `momentum-dk-2026.pdf`.
2. Add a block to `_data/research.yml`:

```yaml
- title: Momentum in Danish equities
  date: 2026-11-30
  authors: Jane Doe, John Doe
  note: >-
    Does 12-1 momentum survive transaction costs on the C25? We tested it on
    2005–2025 data. It does not: the edge disappears after 20 bps round-trip.
  pdf: momentum-dk-2026.pdf     # optional
  link: https://github.com/...  # optional: code or notebook
  label: Negative result        # optional sticker
```

The note is the write-up on the site: two to four sentences covering the question,
what you did and what you found. The newest three also appear on the homepage.

### Add or move a partner: `_data/partners.yml`

```yaml
- name: Example Capital
  tier: partner           # principal | partner | supporter
  role: Event partner
  url: https://example.com
  logo: example-capital.png
```

Upload the logo to `assets/logos/` first: a transparent PNG, roughly square,
at least 200px tall. Principal partners get the big card and lead the homepage
strip. A tier with nobody in it is not shown.

---

## Changing the words on a page

Each page is one file: `index.html`, `about/index.html`, `events/index.html`,
`research/index.html`, `partners/index.html`. Sections are marked with big
comment banners like `<!-- ============ HERO ============ -->`. Find the
banner, then change the text between the tags. Leave the `class="..."` alone,
because the class is what makes it look right.

The top of each page has a small header:

```
---
layout: default
title: 'About - Kwant Klubben'
description: 'One sentence for Google and link previews.'
---
```

Keep the `---` lines. `title` is the browser tab and the search result.

## Links and the contact address

The join form, the Discord invite, GitHub, LinkedIn and the contact email are set
**once**, in `_config.yml`. Change them there. Pages use them as
`{{ site.join_url }}` and so on, and CI fails if one is hardcoded in a page.

## Shared pieces

- `_layouts/default.html`: the head, event banner, nav and footer for every page.
- `_includes/`: small reusable blocks (the dark join band, the event, research
  and partner cards, the social icons).
- `css/styles.css`: all styling. Colours are the variables at the top
  (`--ink-*`, `--paper-*`, `--lime-*`, `--blue-*`, `--gold-*`, `--coral-*`).

## What fails the check, and why

`tools/check-site.py` runs in CI. It fails on:

- **A mistake in a `_data/*.yml` file:** a missing field, a date that is not
  `YYYY-MM-DD`, a time without quotes, an event type that does not exist, a PDF or
  logo that is not where the entry says. The message names the file and entry.
- **A hardcoded join link, Discord invite or contact email** in a page.
- **An inline `style="..."`.** Add a class to `css/styles.css` instead.
- **A page without its `---` header**, or two pages with the same title.
- **A `class` on `<footer>`**, or `hidden` removed from `#kk-nav-panel`. Both
  broke the mobile layout once.
- **An unbalanced `}` in the stylesheet.** CSS silently drops the next rule.
- **A file in `assets/` that nothing uses.**

## Previewing locally (optional)

You do not need to. Push to a branch and CI builds it. If you have Ruby:
`gem install --user-install jekyll -v '~> 3.10' webrick`, then
`sh tools/preview.sh` and open http://localhost:4000.
