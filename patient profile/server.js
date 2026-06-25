const express = require('express');
const mysql = require('mysql2/promise');
const { spawn } = require('child_process');
const path = require('path');

const app = express();


app.use(express.json());

app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dental_clinic',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

function requireField(obj, key) {
  const v = obj?.[key];
  if (v === undefined || v === null) return null;
  return String(v).trim();
}

app.post('/api/patients', async (req, res) => {
  try {
    const body = req.body || {};

    const first_name = requireField(body, 'first_name') || requireField(body, 'firstName');
    const last_name = requireField(body, 'last_name') || requireField(body, 'lastName');
    const date_of_birth = requireField(body, 'date_of_birth') || requireField(body, 'dob');
    let gender = requireField(body, 'gender') || requireField(body, 'sex');
    const contact_number = requireField(body, 'contact_number') || requireField(body, 'contactNumber');
    const email = requireField(body, 'email');
    const house_no = requireField(body, 'house_no');
    const street = requireField(body, 'street');
    const barangay = requireField(body, 'barangay');
    const city = requireField(body, 'city');
    const zip_code = requireField(body, 'zip_code') || requireField(body, 'zip');

    let blood_type = requireField(body, 'blood_type');

    const missing = [];
    if (!first_name) missing.push('first_name');
    if (!last_name) missing.push('last_name');
    if (!date_of_birth) missing.push('date_of_birth');
    if (!gender) missing.push('gender');
    if (!contact_number) missing.push('contact_number');
    if (!email) missing.push('email');
    if (!house_no) missing.push('house_no');
    if (!street) missing.push('street');
    if (!barangay) missing.push('barangay');
    if (!city) missing.push('city');
    if (!zip_code) missing.push('zip_code');
    if (!blood_type) missing.push('blood_type');

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        error: `Missing required field(s): ${missing.join(', ')}`
      });
    }

    const normalizedGender = (gender || '').toLowerCase();
    if (!['male', 'female'].includes(normalizedGender)) {
      return res.status(400).json({ ok: false, error: 'Invalid gender. Use Male or Female.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO patients (
        first_name,
        last_name,
        date_of_birth,
        gender,
        contact_number,
        email,
        house_no,
        street,
        barangay,
        city,
        zip_code,
        blood_type
      ) VALUES (
        :first_name,
        :last_name,
        :date_of_birth,
        :gender,
        :contact_number,
        :email,
        :house_no,
        :street,
        :barangay,
        :city,
        :zip_code,
        :blood_type
      )`,
      {
        first_name,
        last_name,
        date_of_birth,
        gender: normalizedGender,
        contact_number,
        email,
        house_no,
        street,
        barangay,
        city,
        zip_code,
        blood_type
      }
    );


    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      error: err?.message ? String(err.message) : 'Database error'
    });
  }
});

async function ensureDbInitialized() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'db_init.js');

    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`db_init.js exited with code ${code}`));
    });
  });
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

ensureDbInitialized()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Patient profile API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });


