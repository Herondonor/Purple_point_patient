function getFormPayload(form, extra = {}) {
  const payload = { ...extra };
  const fd = new FormData(form);
  for (const [k, v] of fd.entries()) {
    payload[k] = typeof v === 'string' ? v.trim() : v;
  }
  return payload;
}

function genderNormalize(gender) {
  const g = (gender || '').toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return gender;
}

function showResult(el, html) {
  if (!el) return;
  el.innerHTML = html;
}

async function submitStaffForm(e) {
  e.preventDefault();

  const form = e.target;
  const resultBox = document.getElementById('staff-form-result');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  showResult(resultBox, 'Saving staff...');

  try {
    const payload = getFormPayload(form);
    payload.gender = genderNormalize(payload.gender);

    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to add staff');
    }

    showResult(resultBox, `
      <h3>Staff saved successfully!</h3>
      <p>Staff ID: ${data.staff_id}</p>
      <p>Inserted Staff User ID: ${data.user_id ?? 'N/A'}</p>
    `);

    form.reset();
  } catch (err) {
    showResult(resultBox, `<h3 style="color:red;">Database Error</h3><p>${err?.message ? String(err.message) : 'Unknown error'}</p>`);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function submitDoctorForm(e) {
  e.preventDefault();

  const form = e.target;
  const resultBox = document.getElementById('doctor-form-result');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  showResult(resultBox, 'Saving doctor...');

  try {
    const payload = getFormPayload(form);
    payload.gender = genderNormalize(payload.gender);
    payload.employment_status = 'Active';
    payload.license_number = payload.license_number === '' ? null : Number(payload.license_number);


    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to add doctor');
    }

    showResult(resultBox, `
      <h3>Doctor saved successfully!</h3>
      <p>Doctor ID: ${data.doctor_id ?? 'N/A'}</p>
    `);

    form.reset();
  } catch (err) {
    showResult(resultBox, `<h3 style="color:red;">Database Error</h3><p>${err?.message ? String(err.message) : 'Unknown error'}</p>`);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btnDoctor = document.getElementById('btn-show-doctor');
  const btnStaff = document.getElementById('btn-show-staff');
  const doctorCard = document.getElementById('doctor-form-card');
  const staffCard = document.getElementById('staff-form-card');

  function showDoctorForm() {
    if (doctorCard) doctorCard.style.display = 'block';
    if (staffCard) staffCard.style.display = 'none';
  }

  function showStaffForm() {
    if (doctorCard) doctorCard.style.display = 'none';
    if (staffCard) staffCard.style.display = 'block';
  }

  if (btnDoctor) btnDoctor.addEventListener('click', showDoctorForm);
  if (btnStaff) btnStaff.addEventListener('click', showStaffForm);

  const doctorForm = document.getElementById('doctor-form');
  const staffForm = document.getElementById('staff-form');

  if (doctorForm) doctorForm.addEventListener('submit', submitDoctorForm);
  if (staffForm) staffForm.addEventListener('submit', submitStaffForm);
});

