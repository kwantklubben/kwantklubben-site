/* js/kk-events.js — splits events into upcoming and past, and fills the banner.

   The events themselves live in _data/events.yml. Jekyll renders every card at
   build time (so the page works without JavaScript) and embeds the same list as
   JSON in the layout for the banner. This script only decides what is over.

   "Over" is judged in Danish time, whatever the visitor's own timezone: an event
   is past once its date + end time has passed in Europe/Copenhagen. Dates and
   times are compared as "YYYY-MM-DD HH:MM" strings, so there is no UTC-offset
   arithmetic to get wrong around daylight-saving changes. */
(function () {
  'use strict';

  function nowInCopenhagen() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Copenhagen', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return parts.year + '-' + parts.month + '-' + parts.day + ' ' + parts.hour + ':' + parts.minute;
  }

  var now = nowInCopenhagen();
  function isOver(dateStr, endTime) { return (dateStr + ' ' + endTime) <= now; }

  // --- Events page: move finished events into the Past grid, newest first.
  var upcoming = document.querySelector('[data-kk-events="upcoming"]');
  var past = document.querySelector('[data-kk-events="past"]');
  if (upcoming && past) {
    var done = Array.prototype.filter.call(
      upcoming.querySelectorAll('[data-kk-event-ends]'),
      function (card) { return card.getAttribute('data-kk-event-ends') <= now; });
    done.reverse().forEach(function (card) {
      card.classList.add('kk-event--past');
      past.appendChild(card);
    });
    if (done.length) past.parentNode.hidden = false;
    if (!upcoming.children.length) {
      var empty = document.querySelector('[data-kk-events-empty]');
      if (empty) empty.hidden = false;
    }
  }

  // --- Banner on every page: the next event that is not over yet.
  var bar = document.getElementById('kk-eventbar');
  var data = document.getElementById('kk-events-data');
  if (!bar || !data) return;
  var events;
  try { events = JSON.parse(data.textContent); } catch (e) { return; }
  var next = null;
  (events || []).forEach(function (ev) {
    var date = String(ev.date).slice(0, 10);
    if (isOver(date, ev.end)) return;
    if (!next || date + ev.start < String(next.date).slice(0, 10) + next.start) next = ev;
  });
  if (!next) return;

  // Parse the date as UTC midnight and format it in UTC, so the weekday cannot
  // shift for a visitor west of Greenwich.
  var day = new Date(String(next.date).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-GB', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long'
  });
  bar.querySelector('[data-kk-event="title"]').textContent = next.name;
  bar.querySelector('[data-kk-event="meta"]').textContent =
    day + ' · ' + next.start + '–' + next.end + (next.location ? ' · ' + next.location : '');
  bar.hidden = false;
})();
