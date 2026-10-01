/* js/kk-events.js — renders the club's events and drives the site-wide banner.

   Reads /data/events.json, the single source of truth. One array of events, each
   carrying `starts`/`ends` as full ISO-8601 datetimes (with UTC offset). "Next
   upcoming" is computed exactly once here, so the Events page and the banner can
   never disagree.

   Schema (one object per event):
     id        string   unique slug (unused by the renderer, kept for humans)
     name      string   event title
     summary   string   short description shown on the card
     starts    string   ISO-8601 datetime WITH offset ("2026-09-24T16:30:00+02:00")
     ends      string   ISO-8601 datetime; the event is upcoming while ends > now
     location  string   room / venue
     link      string?  add-to-calendar / registration URL (omit to hide the button)

   Where it renders:
     [data-kk-events]   the Events page grid — upcoming (soonest first), then past
                        (most recent first). Past cards are dimmed + stamped.
     #kk-eventbar       the site-wide banner — filled with the NEXT upcoming event
                        and revealed; left hidden when nothing is upcoming.

   Both degrade gracefully: a fetch/parse failure leaves the static placeholder in
   place or the banner hidden — never a broken grid or a stale event. */
(function () {
  'use strict';

  var INDEX_URL = '/data/events.json';

  function iso(ev, key) {
    var d = new Date(ev && ev[key] || 0);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  function isUpcoming(ev) { return iso(ev, 'ends') > Date.now(); }

  function dayLabel(value) {
    return new Date(value).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  function timeLabel(value) {
    return new Date(value).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  // "Thursday 24 September · 16:30 · U313, University of Southern Denmark"
  function metaLine(ev) {
    var out = dayLabel(ev.starts) + ' · ' + timeLabel(ev.starts);
    if (ev.location) out += ' · ' + ev.location;
    return out;
  }

  function buildCard(ev) {
    var upcoming = isUpcoming(ev);

    var card = document.createElement('div');
    card.className = 'kk-card kk-card--pad-md kk-card--hover';
    if (!upcoming) card.classList.add('kk-card--flat');

    var head = document.createElement('div');
    head.className = 'kk-card__head';
    var title = document.createElement('h3');
    title.className = 'kk-card__t';
    title.textContent = ev.name;
    head.appendChild(title);

    var stamp = document.createElement('span');
    stamp.className = 'kk-stamp kk-stamp--sm ' +
      (upcoming ? 'kk-stamp--live' : 'kk-stamp--neutral');
    stamp.textContent = upcoming ? 'Upcoming' : 'Past event';
    head.appendChild(stamp);
    card.appendChild(head);

    if (ev.summary) {
      var p = document.createElement('p');
      p.className = 'kk-card__d';
      p.textContent = ev.summary;
      card.appendChild(p);
    }

    var meta = document.createElement('div');
    meta.className = 'kk-card__foot';
    meta.textContent = metaLine(ev);
    card.appendChild(meta);

    if (ev.link) {
      var btn = document.createElement('a');
      btn.className = 'kk-btn kk-btn--secondary kk-btn--sm';
      btn.href = ev.link;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.textContent = 'Add to calendar';
      card.appendChild(btn);
    }

    return card;
  }

  function sort(events) {
    var upcoming = events.filter(isUpcoming)
      .sort(function (a, b) { return iso(a, 'starts') - iso(b, 'starts'); });
    var past = events.filter(function (e) { return !isUpcoming(e); })
      .sort(function (a, b) { return iso(b, 'starts') - iso(a, 'starts'); });
    return upcoming.concat(past);
  }

  function renderGrid(host, events) {
    if (!events.length) {
      host.setAttribute('data-kk-empty', 'true');
      return;
    }
    host.setAttribute('data-kk-rendered', String(events.length));
    host.innerHTML = '';
    events.forEach(function (ev) {
      if (ev && ev.name) host.appendChild(buildCard(ev));
    });
  }

  function renderBanner(events) {
    var bar = document.getElementById('kk-eventbar');
    if (!bar) return;

    var next = null;
    events.forEach(function (ev) {
      if (!isUpcoming(ev)) return;
      if (!next || iso(ev, 'starts') < iso(next, 'starts')) next = ev;
    });
    if (!next) return; // nothing upcoming -> leave the bar hidden

    var title = bar.querySelector('[data-kk-event="title"]');
    var meta = bar.querySelector('[data-kk-event="meta"]');
    var link = bar.querySelector('[data-kk-event="link"]');
    if (title) title.textContent = next.name;
    if (meta) meta.textContent = metaLine(next);
    if (link && next.link) link.href = next.link;
    bar.hidden = false;
  }

  fetch(INDEX_URL, { headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (body) {
      var events = Array.isArray(body && body.events) ? body.events : [];
      var sorted = sort(events);
      var hosts = document.querySelectorAll('[data-kk-events]');
      Array.prototype.forEach.call(hosts, function (h) { renderGrid(h, sorted); });
      renderBanner(sorted);
    })
    .catch(function () { /* leave placeholders / hidden banner in place */ });
})();