const fs = require('fs');
const app = require('./src/config/app.json');
const payment = require('./src/config/payment.json');

const sql = `
INSERT OR REPLACE INTO app_settings (key, value) VALUES ('app', '${JSON.stringify(app)}');
INSERT OR REPLACE INTO app_settings (key, value) VALUES ('payment', '${JSON.stringify(payment.methods)}');
`;
fs.writeFileSync('seed.sql', sql);
