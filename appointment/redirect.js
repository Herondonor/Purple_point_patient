async function loadAppointments() {
  const response = await fetch('/api/appointments');
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to load appointments');
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();
    return `${dateStr} ${timeStr}`;
  } catch {
    return value;
  }
}

function renderAppointments(appointments, container) {
  container.innerHTML = '';

  if (!appointments.length) {
    container.innerHTML = '<p>No saved appointments found.</p>';
    return;
  }

  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.width = '100%';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">ID</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Patient</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Date & Time</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Type</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Status</th>
        <th style="border:1px solid #ccc;padding:8px;text-align:left;">Reason</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  appointments.forEach((appointment) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="border:1px solid #ccc;padding:8px;">${appointment.id}</td>
      <td style="border:1px solid #ccc;padding:8px;">${appointment.first_name} ${appointment.last_name}</td>
      <td style="border:1px solid #ccc;padding:8px;">${formatDate(appointment.appointment_date)}</td>
      <td style="border:1px solid #ccc;padding:8px;">${appointment.appointment_type || '—'}</td>
      <td style="border:1px solid #ccc;padding:8px;">${appointment.appointment_status}</td>
      <td style="border:1px solid #ccc;padding:8px;">${appointment.reason || '—'}</td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(table);
}

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
      renderAppointments(appointments, resultBox);
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
      .then((appointments) => renderAppointments(appointments, resultBox))
      .catch((err) => {
        resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message || 'Unable to load appointments.'}</p>`;
      });
  }
});
