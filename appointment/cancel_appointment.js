async function submitCancelAppointment(event) {
  event.preventDefault();

  const form = event.target;
  const resultBox = document.getElementById('cancel-appointment-result');
  resultBox.innerHTML = '';

  const appointmentId = form.appointment_id.value.trim();
  const cancelReason = form.cancel_reason.value.trim();

  if (!appointmentId || !cancelReason) {
    resultBox.innerHTML = '<p style="color:red;">Enter both appointment_id and cancel_reason.</p>';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  resultBox.textContent = 'Cancelling appointment...';

  try {
    const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: cancelReason }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to cancel appointment');
    }

    resultBox.innerHTML = `
      <h2>Appointment Cancelled</h2>
      <p>Appointment ID: ${appointmentId}</p>
      <p>Reason: ${cancelReason}</p>
      <p><a href="choose_appointment.html">Back to appointment options</a></p>
    `;
  } catch (err) {
    resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message || 'Unknown error'}</p>`;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cancel-appointment-form');
  if (form) form.addEventListener('submit', submitCancelAppointment);
});
