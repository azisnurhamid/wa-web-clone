const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/config/payment.json', 'utf8'));
const methods = JSON.stringify(data.methods).replace(/'/g, "''");
const sql = `INSERT INTO app_settings (key, value) VALUES ('payment', '${methods}') ON CONFLICT(key) DO UPDATE SET value=excluded.value;`;
fs.writeFileSync('seed_payment.sql', sql);
console.log('seed_payment.sql created');
