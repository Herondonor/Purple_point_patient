async function submitPatientForm(e) {
  e.preventDefault();

  const form = e.target;
  const resultBox = document.getElementById('add-patient-result');
  resultBox.innerHTML = '';

  const payload = {
    first_name: form.first_name.value,
    last_name: form.last_name.value,
    date_of_birth: form.date_of_birth.value,
    gender: form.gender.value,
    contact_number: form.contact_number.value || '',
    email: form.email.value || '',
    house_no: form.house_no.value || '',
    street: form.street.value || '',
    barangay: form.barangay.value || '',
    city: form.city.value || '',
    zip_code: form.zip_code.value || '',
    blood_type: form.blood_type.value || ''
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    resultBox.textContent = 'Saving patient...';

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || 'Failed to add patient');
    }

    resultBox.innerHTML = `
      <h2>Patient added successfully!</h2>
      <p>Patient ID: ${data.id}</p>
      <a href="index.html">Add Another Patient</a>
    `;
  } catch (err) {
    resultBox.innerHTML = `<h2>Database Error</h2><p>${err?.message ? String(err.message) : 'Unknown error'}</p>`;
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-patient-form');
  if (form) form.addEventListener('submit', submitPatientForm);
});

