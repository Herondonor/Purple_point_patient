async function loadAppointments() {
  const response = await fetch('/api/appointments');
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to load appointments');
  }
  return response.json();
}

function parseDateParts(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const day = d.getDate();

  const timeLabel = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return { year, month, day, timeLabel };
}

function formatAppointmentLabel(appointment) {
  const first = (appointment.first_name || '').trim();
  const last = (appointment.last_name || '').trim();
  const initials = first ? `${first[0].toUpperCase()}.` : '';
  const time = parseDateParts(appointment.appointment_date)?.timeLabel || '';

  const namePart = `${initials} ${last}`.trim();
  return time ? `${namePart} — ${time}` : namePart;
}

function renderAppointmentsCalendar(appointments, container, baseDate = new Date()) {
  // container state: { base: Date } where base is the month being shown
  if (!container.__apptsCalendarState) container.__apptsCalendarState = { base: new Date() };
  container.__apptsCalendarState.base = baseDate;

  container.innerHTML = '';



  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth(); // 0-11


  const filtered = (appointments || []).filter((a) => {
    const parts = parseDateParts(a.appointment_date);
    return parts && parts.year === currentYear && parts.month === currentMonth;
  });

  // Group by day (1..31)
  const byDay = new Map();
  filtered.forEach((a) => {
    const parts = parseDateParts(a.appointment_date);
    if (!parts) return;
    const day = parts.day;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(a);
  });

  const monthLabel = baseDate.toLocaleDateString([], { month: 'long', year: 'numeric' });



  container.innerHTML = `
    <div class="calendar-wrap" style="margin-top:8px;">
      <div class="calendar-nav" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <button type="button" style="border:1px solid #ddd;background:#fff;border-radius:6px;padding:6px 10px;cursor:pointer;" onclick="window.__apptsCalendarChangeMonth && window.__apptsCalendarChangeMonth(-1)">&#8249;</button>
        <div style="font-weight:700;">${monthLabel}</div>
        <button type="button" style="border:1px solid #ddd;background:#fff;border-radius:6px;padding:6px 10px;cursor:pointer;" onclick="window.__apptsCalendarChangeMonth && window.__apptsCalendarChangeMonth(1)">&#8250;</button>
      </div>


      <div class="calendar-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;" id="cal-headers" aria-hidden="true">
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Sun</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Mon</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Tue</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Wed</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Thu</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Fri</div>
        <div style="padding:8px;font-size:12px;font-weight:700;color:#666;border-bottom:1px solid #eee;">Sat</div>
      </div>

      <div class="calendar-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:0;" id="cal-body"></div>

      ${!appointments.length ? '<p style="margin-top:12px;">No saved appointments found.</p>' : ''}
    </div>
  `;

  const calBody = container.querySelector('#cal-body');

  const firstDay = new Date(currentYear, currentMonth, 1);

  const startWeekday = firstDay.getDay(); // 0..6

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement('div');
    empty.style.minHeight = '92px';
    empty.style.border = '1px solid #eee';
    empty.style.background = '#fafafa';
    calBody.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.style.minHeight = '92px';
    cell.style.border = '1px solid #eee';
    cell.style.padding = '8px';
    cell.style.boxSizing = 'border-box';
    cell.style.display = 'flex';
    cell.style.flexDirection = 'column';
    cell.style.overflow = 'hidden';

    const top = document.createElement('div');
    top.style.fontWeight = '800';
    top.style.fontSize = '12px';
    top.style.marginBottom = '6px';
    top.textContent = day;

    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '6px';

    const items = byDay.get(day) || [];
    if (items.length) {
      items
        .sort((a, b) => {
          const da = new Date(a.appointment_date).getTime();
          const db = new Date(b.appointment_date).getTime();
          return da - db;
        })
        .slice(0, 4)
        .forEach((a) => {
          const tag = document.createElement('div');
          tag.style.fontSize = '12px';
          tag.style.lineHeight = '1.2';
          tag.style.whiteSpace = 'nowrap';
          tag.style.overflow = 'hidden';
          tag.style.textOverflow = 'ellipsis';

          const timeLabel = parseDateParts(a.appointment_date)?.timeLabel || '';
          const dateLabel = a.appointment_date ? new Date(a.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
          const status = a.appointment_status || '';
          const timeNoSeconds = timeLabel ? timeLabel.replace(/:\d\d\b/, '') : '';
          const meta = `${formatAppointmentLabel(a)} — ${status}`;


          tag.innerHTML = meta;

          list.appendChild(tag);
        });


      if (items.length > 4) {
        const more = document.createElement('div');
        more.style.fontSize = '12px';
        more.style.color = '#666';
        more.textContent = `+${items.length - 4} more`;
        list.appendChild(more);
      }
    } else {
      const empty = document.createElement('div');
      empty.style.fontSize = '12px';
      empty.style.color = '#aaa';
      empty.textContent = '—';
      list.appendChild(empty);
    }


    cell.appendChild(top);
    cell.appendChild(list);
    calBody.appendChild(cell);
  }
}


window.__apptsCalendarChangeMonth = function (delta) {
  const resultBox = document.getElementById('choose-appointment-result');
  if (!resultBox) return;
  const state = resultBox.__apptsCalendarState;
  const base = state?.base ? new Date(state.base) : new Date();
  base.setMonth(base.getMonth() + delta);

  loadAppointments()
    .then((appointments) => renderAppointmentsCalendar(appointments, resultBox, base))
    .catch((err) => {
      resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message || 'Unable to load appointments.'}</p>`;
    });
};

async function handleChooseAppointmentSubmit(event) {

  event.preventDefault();

  const form = event.target;
  const resultBox = document.getElementById('choose-appointment-result');
  resultBox.innerHTML = '';

  const selectedOption = form['appointment-option'].value;
  if (selectedOption === 'add-appointment') {
    window.location.href = 'add_appointment.html';
    return;
  }

  if (selectedOption === 'cancel-appointment') {
    window.location.href = 'cancel_appointment.html';
    return;
  }

  if (selectedOption === 'view-appointments') {
    try {
      const appointments = await loadAppointments();
      renderAppointmentsCalendar(appointments, resultBox);
    } catch (err) {
      resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message || 'Unable to load appointments.'}</p>`;
    }
    return;
  }

  resultBox.innerHTML = '<p style="color:red;">Please choose an appointment option.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('choose-appointment-form');
  const resultBox = document.getElementById('choose-appointment-result');

  if (form) form.addEventListener('submit', handleChooseAppointmentSubmit);

  if (new URLSearchParams(window.location.search).get('view') === '1' && resultBox) {
    loadAppointments()
      .then((appointments) => renderAppointmentsCalendar(appointments, resultBox))
      .catch((err) => {
        resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message || 'Unable to load appointments.'}</p>`;
      });
  }
});
