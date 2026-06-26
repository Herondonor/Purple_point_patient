function parseAppointmentDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    appointment_date: `${year}-${month}-${day}`,
    appointment_time: `${hours}:${minutes}:00`,
  };
}

async function submitAppointmentForm(event) {
  event.preventDefault();

  const form = event.target;
  const resultBox = document.getElementById('add-appointment-result');
  resultBox.innerHTML = '';

  const dateParts = parseAppointmentDateTime(form.appointment_date.value);
  const payload = {
    patient_id: Number(form.patient_id.value.trim()),
    appointment_date: dateParts?.appointment_date || '',
    appointment_time: dateParts?.appointment_time || '',
    appointment_type: form.appointment_type.value,
    status: form.appointment_status.value,
    reason: form.reason_for_visit.value.trim() || null,
  };

  const missing = [];
  if (!payload.patient_id) missing.push('patient_id');
  if (!payload.appointment_date || !payload.appointment_time) missing.push('appointment_date');
  if (!payload.appointment_type) missing.push('appointment_type');
  if (!payload.status) missing.push('status');

  if (missing.length) {
    resultBox.innerHTML = `<p style="color:red;">Please complete the following: ${missing.join(', ')}</p>`;
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    resultBox.textContent = 'Saving appointment...';

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to add appointment');
    }

    resultBox.innerHTML = `
      <h2>Appointment saved successfully!</h2>
      <p>Appointment ID: ${data.id}</p>
      <p>Patient ID: ${payload.patient_id}</p>
      <p>Date: ${payload.appointment_date}</p>
      <p>Time: ${payload.appointment_time}</p>
      <p>Status: ${payload.status}</p>
      <a href="choose_appointment.html">Back to appointment options</a>
    `;
    form.reset();
  } catch (err) {
    resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message ? String(err.message) : 'Unknown error'}</p>`;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-appointment-form');
  if (form) form.addEventListener('submit', submitAppointmentForm);
});
