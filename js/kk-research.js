/* js/kk-research.js — renders the club's published research onto a page.

   Reads the single source of truth: kwantklubben-public-research/projects.json-
   raw.githubusercontent.com/kwantklubben/kwantklubben-public-research/main/projects.json
   Published there by the private-repo publish workflow (stage_public_projects.py).
   mark-up with the same card idiom the static placeholders always used, so a page
   with no approved projects shows the honest placeholder and one with projects
   replaces it with real cards.

   Usage (on any page):
     <div class="kk-projects-grid" data-kk-research data-limit="3"></div>
     <script src="/js/kk-research.js" defer></script>

   - data-limit  -> render at most N most-recent projects (omit for all)
   - cards link out to the project's source URL when present
   - a fetch/parse failure leaves the placeholder in place (clearly marked), never
     a broken grid. The site is fully static + no-JS friendly: this script is
     enhancement on top of the same cards a no-JS visitor already sees.
*/
(function () {
  'use strict';
  var INDEX_URL =
    'https://raw.githubusercontent.com/kwantklubben/kwantklubben-public-research/main/projects.json';

  var hosts = document.querySelectorAll('[data-kk-research]');
  if (!hosts.length) return;

  // Map a project's status to the design-system verdict sticker. Only final or
  // live outcomes get a stamp — "in review" is deliberately not here (busy
  // work, not a verdict). Unknown statuses fall back to a neutral stamp.
  function stampClass(status) {
    var s = String(status || '').toLowerCase();
    if (s.indexOf('flagship') >= 0) return 'kk-stamp--flagship';
    if (s.indexOf('kill') >= 0) return 'kk-stamp--killed';
    if (s.indexOf('live') >= 0 || s.indexOf('paper') >= 0) return 'kk-stamp--live';
    return 'kk-stamp--neutral';
  }

  function renderGrid(host) {
    var limit = parseInt(host.getAttribute('data-limit') || '', 10);
    fetch(INDEX_URL, { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (body) {
        var projects = Array.isArray(body && body.projects) ? body.projects : [];
        // featured first, then most recent (stable for ties)
        projects.sort(function (a, b) {
          var fa = !!(a && a.featured),
            fb = !!(b && b.featured);
          if (fa !== fb) return fa ? -1 : 1;
          var da = (a && a.date) || '',
            db = (b && b.date) || '';
          return da < db ? 1 : da > db ? -1 : 0;
        });
        if (isFinite(limit) && limit > 0) projects = projects.slice(0, limit);

        if (!projects.length) {
          // no approved projects yet — keep the static placeholder, but leave proof
          host.setAttribute('data-kk-empty', 'true');
          return;
        }
        host.setAttribute('data-kk-rendered', String(projects.length));

        // clear the static placeholder, render real cards
        host.innerHTML = '';
        projects.forEach(function (p) {
          if (!p || !p.title) return;

          // The whole card is the link — there is no separate
          // "View on GitHub" row. Featured/research entries link to
          // p.source (the atlas's live site, research repos, etc.).
          var card = document.createElement('a');
          card.className = 'kk-card kk-card--pad-md kk-card--hover kk-card--link';
          card.href = p.source || '#';
          card.setAttribute('rel', 'noopener');
          card.target = '_blank';

          var head = document.createElement('div');
          head.className = 'kk-card__head';
          var title = document.createElement('h3');
          title.className = 'kk-card__t';
          title.textContent = p.title;
          head.appendChild(title);
          if (p.status) {
            var sticker = document.createElement('span');
            sticker.className = 'kk-stamp kk-stamp--sm ' + stampClass(p.status);
            sticker.textContent = p.status;
            head.appendChild(sticker);
          }
          card.appendChild(head);

          if (p.summary) {
            var sum = document.createElement('p');
            sum.className = 'kk-card__d';
            sum.textContent = p.summary;
            card.appendChild(sum);
          }

          var foot = document.createElement('div');
          foot.className = 'kk-card__foot';
          var meta = [];
          if (p.date) meta.push(p.date);
          if (p.authors && p.authors.length) meta.push('@' + p.authors.join(', @'));
          foot.textContent = meta.join(' · ');
          card.appendChild(foot);

          host.appendChild(card);
        });
      })
      .catch(function (err) {
        // unavailable — leave the static placeholder and say why in the console
        host.setAttribute('data-kk-error', String(err && err.message));
      });
  }

  hosts.forEach(renderGrid);
})();