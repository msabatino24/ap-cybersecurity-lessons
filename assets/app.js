(async function () {
  const [schedule, meta] = await Promise.all([
    fetch('data/schedule.json').then(r => r.json()),
    fetch('data/meta.json').then(r => r.json()),
  ]);

  const introText = document.getElementById('introText');
  introText.textContent =
    `${meta.totalSessions} class sessions, ${formatRange(meta.dateStart)} through ${formatRange(meta.dateEnd)}. ` +
    `Each card shows what we're covering that day and the CodeHS / Cyber.org resource it comes from.`;

  function formatRange(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // ---- Build nav pills ----
  const navPills = document.getElementById('navPills');
  const allPill = makePill('all', 'All Units', true);
  navPills.appendChild(allPill);
  meta.units.forEach(u => navPills.appendChild(makePill(u.key, u.label.split('·')[0].trim())));

  function makePill(key, label, active) {
    const btn = document.createElement('button');
    btn.className = 'pill' + (active ? ' active' : '');
    btn.textContent = label;
    btn.dataset.key = key;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      if (key === 'all') {
        document.querySelectorAll('.unit-section').forEach(s => s.classList.remove('hidden'));
        window.scrollTo({ top: document.getElementById('content').offsetTop - 90, behavior: 'smooth' });
      } else {
        const el = document.getElementById('section-' + key);
        document.querySelectorAll('.unit-section').forEach(s => s.classList.remove('hidden'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return btn;
  }

  // ---- Group sessions by unit, preserving first-appearance order ----
  const groups = [];
  const groupIndex = {};
  schedule.forEach(row => {
    if (!(row.unitKey in groupIndex)) {
      groupIndex[row.unitKey] = groups.length;
      groups.push({ key: row.unitKey, label: row.unitLabel, color: row.unitColor, rows: [] });
    }
    groups[groupIndex[row.unitKey]].rows.push(row);
  });

  const content = document.getElementById('content');
  groups.forEach(g => {
    const section = document.createElement('section');
    section.className = 'unit-section';
    section.id = 'section-' + g.key;
    section.style.setProperty('--unit-color', g.color);

    const head = document.createElement('div');
    head.className = 'unit-head';
    head.style.setProperty('--unit-color', g.color);
    const first = g.rows[0], last = g.rows[g.rows.length - 1];
    head.innerHTML = `<h2>${g.label}</h2><span class="unit-sub">${g.rows.length} session${g.rows.length === 1 ? '' : 's'} · ${formatRange(first.date)} – ${formatRange(last.date)}</span>`;
    section.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'day-grid';
    g.rows.forEach(row => grid.appendChild(makeCard(row, g.color)));
    section.appendChild(grid);

    content.appendChild(section);
  });

  function makeCard(row, color) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.dataset.date = row.date;
    card.style.setProperty('--unit-color', color);
    card.dataset.search = (row.title + ' ' + row.activity + ' ' + row.topic + ' ' + row.unitLabel).toLowerCase();

    const chips = row.resources.map(r => {
      const cls = 'chip' + (r.kind === 'Cyber.org' ? ' cyberorg' : '') + (r.url ? ' link' : '');
      const text = `${escapeHtml(r.kind)}: ${escapeHtml(r.label)}`;
      return r.url
        ? `<a class="${cls}" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${text}</a>`
        : `<span class="${cls}">${text}</span>`;
    }).join('');

    card.innerHTML = `
      <div class="row1">
        <span class="date-label">${row.dateLabel}</span>
        <span class="badges">
          <span class="letter-badge" title="${row.letter} Day">${row.letter}</span>
          <span class="stype-tag ${row.stype}">${escapeHtml(row.stypeLabel)}</span>
        </span>
      </div>
      ${row.topic && row.topic !== '—' ? `<div class="topic-num">Topic ${escapeHtml(row.topic)}</div>` : ''}
      <h3>${escapeHtml(row.title)}</h3>
      <p class="activity">${escapeHtml(row.activity)}</p>
      <div class="res-chips">${chips}</div>
      ${row.anchor ? `<div class="anchor-note">${escapeHtml(row.anchor)}</div>` : ''}
    `;
    return card;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- Search ----
  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let anyVisible = false;
    document.querySelectorAll('.unit-section').forEach(section => {
      let sectionHasMatch = false;
      section.querySelectorAll('.day-card').forEach(card => {
        const match = !q || card.dataset.search.includes(q);
        card.classList.toggle('hidden', !match);
        if (match) sectionHasMatch = true;
      });
      section.classList.toggle('hidden', !sectionHasMatch);
      if (sectionHasMatch) anyVisible = true;
    });
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.pill[data-key="all"]').classList.add('active');
  });

  // ---- Today banner + jump-to-today ----
  const todayIso = new Date().toISOString().slice(0, 10);
  const banner = document.getElementById('todayBanner');
  const todayRow = schedule.find(r => r.date === todayIso);
  const futureRow = schedule.find(r => r.date > todayIso);

  if (todayRow) {
    banner.innerHTML = todayBannerHtml(`<b>Today (${todayRow.dateLabel}, ${todayRow.letter} Day):</b> ${escapeHtml(todayRow.title)}`);
  } else if (todayIso < schedule[0].date) {
    banner.innerHTML = todayBannerHtml(`<b>Course starts ${schedule[0].dateLabel}:</b> ${escapeHtml(schedule[0].title)}`);
  } else if (futureRow) {
    banner.innerHTML = todayBannerHtml(`<b>No class today.</b> Next class: ${futureRow.dateLabel} (${futureRow.letter} Day) — ${escapeHtml(futureRow.title)}`);
  } else {
    banner.innerHTML = todayBannerHtml(`<b>The course calendar has concluded for the year.</b>`);
  }

  function todayBannerHtml(inner) {
    return `<div class="today-card"><span class="dot"></span><span>${inner}</span></div>`;
  }

  document.getElementById('todayBtn').addEventListener('click', () => {
    const target = todayRow || futureRow;
    if (!target) return;
    document.querySelectorAll('.unit-section').forEach(s => s.classList.remove('hidden'));
    const card = document.querySelector(`.day-card[data-date="${target.date}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('is-today');
      setTimeout(() => card.classList.remove('is-today'), 2500);
    }
  });

  // Permanently mark today's card, if any
  if (todayRow) {
    const card = document.querySelector(`.day-card[data-date="${todayRow.date}"]`);
    if (card) card.classList.add('is-today');
  }
})();
